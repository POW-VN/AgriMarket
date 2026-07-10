package org.example.agrimarket.service;

import org.example.agrimarket.dto.ChatMessageResponseDTO;
import org.example.agrimarket.dto.ConversationResponseDTO;
import org.example.agrimarket.dto.SendMessageRequestDTO;
import org.example.agrimarket.model.*;
import org.example.agrimarket.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ChatService {

    @Autowired
    private ConversationRepository conversationRepository;

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private FarmerRepository farmerRepository;

    @Autowired
    private OrderRepository orderRepository;

    public List<ConversationResponseDTO> getConversations(String email) {
        // Resolve user role
        Optional<Farmer> farmerOpt = farmerRepository.findByEmail(email);
        if (farmerOpt.isPresent()) {
            Farmer farmer = farmerOpt.get();
            List<Conversation> conversations = conversationRepository.findAllByFarmerId(farmer.getId());
            return conversations.stream()
                    .map(conv -> mapToConversationDTO(conv, farmer.getId(), "farmer"))
                    .collect(Collectors.toList());
        }

        Optional<Customer> customerOpt = customerRepository.findByEmail(email);
        if (customerOpt.isPresent()) {
            Customer customer = customerOpt.get();
            List<Conversation> conversations = conversationRepository.findAllByCustomerId(customer.getId());
            return conversations.stream()
                    .map(conv -> mapToConversationDTO(conv, customer.getId(), "customer"))
                    .collect(Collectors.toList());
        }

        // Return empty list instead of throwing an error for Admins to keep global ChatPopup clean
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent()) {
            return new ArrayList<>();
        }

        throw new RuntimeException("Tài khoản không tìm thấy");
    }

    @Transactional
    public ConversationResponseDTO startConversation(String email, Long partnerId) {
        Optional<Farmer> farmerOpt = farmerRepository.findByEmail(email);
        
        // Case 1: Logged in user is a Farmer, starting conversation with a Customer
        if (farmerOpt.isPresent()) {
            Farmer farmer = farmerOpt.get();
            Customer customer = customerRepository.findById(partnerId)
                    .orElseThrow(() -> new RuntimeException("Khách hàng không tồn tại"));
            
            Conversation conv = conversationRepository.findByCustomerIdAndFarmerId(customer.getId(), farmer.getId())
                    .orElseGet(() -> {
                        Conversation newConv = Conversation.builder()
                                .customer(customer)
                                .farmer(farmer)
                                .build();
                        return conversationRepository.save(newConv);
                    });
            
            return mapToConversationDTO(conv, farmer.getId(), "farmer");
        }

        // Case 2: Logged in user is a Customer, starting conversation with a Farmer
        Optional<Customer> customerOpt = customerRepository.findByEmail(email);
        if (customerOpt.isPresent()) {
            Customer customer = customerOpt.get();
            Farmer farmer = farmerRepository.findById(partnerId)
                    .orElseThrow(() -> new RuntimeException("Nông trại không tồn tại"));
            
            Conversation conv = conversationRepository.findByCustomerIdAndFarmerId(customer.getId(), farmer.getId())
                    .orElseGet(() -> {
                        Conversation newConv = Conversation.builder()
                                .customer(customer)
                                .farmer(farmer)
                                .build();
                        return conversationRepository.save(newConv);
                    });
            
            return mapToConversationDTO(conv, customer.getId(), "customer");
        }

        throw new RuntimeException("Tài khoản không tìm thấy");
    }

    public List<ChatMessageResponseDTO> getMessages(Long conversationId, String email) {
        // Verify user is part of conversation
        Conversation conv = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Cuộc hội thoại không tồn tại"));
        
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Tài khoản không tìm thấy"));

        boolean isPart = conv.getCustomer().getId().equals(user.getId()) || conv.getFarmer().getId().equals(user.getId());
        if (!isPart) {
            throw new RuntimeException("Bạn không có quyền truy cập cuộc trò chuyện này");
        }

        // Mark incoming messages as read
        List<ChatMessage> unreadMessages = chatMessageRepository.findAllByConversationIdAndSenderIdNotAndIsReadFalse(conversationId, user.getId());
        if (!unreadMessages.isEmpty()) {
            unreadMessages.forEach(msg -> msg.setIsRead(true));
            chatMessageRepository.saveAll(unreadMessages);
        }

        List<ChatMessage> messages = chatMessageRepository.findAllByConversationIdOrderByCreatedAtAsc(conversationId);
        return messages.stream().map(this::mapToMessageDTO).collect(Collectors.toList());
    }

    @Transactional
    public ChatMessageResponseDTO sendMessage(Long conversationId, String email, SendMessageRequestDTO dto) {
        Conversation conv = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Cuộc hội thoại không tồn tại"));

        User sender = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Tài khoản không tìm thấy"));

        String senderRole = null;
        if (conv.getFarmer().getId().equals(sender.getId())) {
            senderRole = "farmer";
        } else if (conv.getCustomer().getId().equals(sender.getId())) {
            senderRole = "customer";
        } else {
            throw new RuntimeException("Bạn không phải thành viên của cuộc hội thoại này");
        }

        if (conv.getBlockedBy() != null) {
            throw new RuntimeException("Cuộc trò chuyện này đang bị chặn.");
        }

        ChatMessage msg = ChatMessage.builder()
                .conversation(conv)
                .sender(sender)
                .senderRole(senderRole)
                .content(dto.getContent())
                .type(dto.getType() != null ? dto.getType() : "text")
                .fileName(dto.getFileName())
                .fileSize(dto.getFileSize())
                .locationName(dto.getLocationName())
                .mapUrl(dto.getMapUrl())
                .contactName(dto.getContactName())
                .contactPhone(dto.getContactPhone())
                .contactAvatar(dto.getContactAvatar())
                .isRead(false)
                .build();

        chatMessageRepository.save(msg);

        // Update conversation timestamp
        conv.setUpdatedAt(LocalDateTime.now());
        conversationRepository.save(conv);

        return mapToMessageDTO(msg);
    }

    private ConversationResponseDTO mapToConversationDTO(Conversation conv, Long currentUserId, String currentUserRole) {
        String partnerId;
        String name;
        String avatar;
        String phone;
        String farmAddress = "";
        String description = "";

        String memberLevel = "Thành viên Đồng hành";
        String joinedDate = "Chưa rõ";
        long completedOrdersCount = 0;

        if ("farmer".equals(currentUserRole)) {
            // Partner is customer
            Customer customer = conv.getCustomer();
            partnerId = String.valueOf(customer.getId());
            name = customer.getFullName();
            avatar = customer.getAvatarUrl();
            phone = customer.getPhone();
            if (customer.getAddresses() != null && !customer.getAddresses().isEmpty()) {
                farmAddress = customer.getAddresses().get(0).getAddress();
            } else {
                farmAddress = "Chưa cập nhật địa chỉ";
            }

            if (customer.getCreatedAt() != null) {
                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
                joinedDate = customer.getCreatedAt().format(formatter);
            }

            completedOrdersCount = orderRepository.countByCustomerIdAndStatus(customer.getId(), "delivered");

            if (completedOrdersCount >= 10) {
                memberLevel = "Thành viên Vàng";
            } else if (completedOrdersCount >= 5) {
                memberLevel = "Thành viên Bạc";
            } else {
                memberLevel = "Thành viên Đồng hành";
            }
        } else {
            // Partner is farmer
            Farmer farmer = conv.getFarmer();
            partnerId = String.valueOf(farmer.getId());
            name = farmer.getFarmName() != null && !farmer.getFarmName().isEmpty() ? farmer.getFarmName() : farmer.getFullName();
            avatar = farmer.getAvatarUrl();
            phone = farmer.getPhone();
            farmAddress = farmer.getFarmAddress();
            description = farmer.getDescription();
        }

        List<ChatMessage> dbMessages = chatMessageRepository.findAllByConversationIdOrderByCreatedAtAsc(conv.getId());
        List<ChatMessageResponseDTO> messageDTOs = dbMessages.stream()
                .map(this::mapToMessageDTO)
                .collect(Collectors.toList());

        List<String> mediaImages = dbMessages.stream()
                .filter(m -> "image".equals(m.getType()))
                .map(ChatMessage::getContent)
                .collect(Collectors.toList());

        long unreadCount = chatMessageRepository.countByConversationIdAndSenderIdNotAndIsReadFalse(conv.getId(), currentUserId);

        return ConversationResponseDTO.builder()
                .id(String.valueOf(conv.getId()))
                .name(name)
                .avatar(avatar)
                .phone(phone)
                .farmAddress(farmAddress)
                .activeState("Đang hoạt động")
                .isOnline(true)
                .unreadCount(unreadCount)
                .isPinned(false)
                .isMuted(false)
                .isBlocked(conv.getBlockedBy() != null)
                .type("normal")
                .description(description)
                .blockedBy(conv.getBlockedBy())
                .partnerId(partnerId)
                .memberLevel(memberLevel)
                .joinedDate(joinedDate)
                .completedOrdersCount(completedOrdersCount)
                .messages(messageDTOs)
                .mediaImages(mediaImages)
                .build();
    }

    private ChatMessageResponseDTO mapToMessageDTO(ChatMessage msg) {
        String textVal = msg.getContent();
        if ("file".equals(msg.getType())) {
            textVal = msg.getFileName();
        } else if ("location".equals(msg.getType())) {
            textVal = msg.getLocationName();
        } else if ("contact".equals(msg.getType())) {
            textVal = msg.getContactName();
        }

        String mappedSender = "user";
        if ("farmer".equals(msg.getSenderRole())) {
            mappedSender = "farmer";
        }

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm");
        String timeStr = msg.getCreatedAt() != null ? msg.getCreatedAt().format(formatter) : "";
        Long timestampVal = msg.getCreatedAt() != null ? 
                msg.getCreatedAt().atZone(ZoneId.systemDefault()).toInstant().toEpochMilli() : 0L;

        return ChatMessageResponseDTO.builder()
                .id(String.valueOf(msg.getId()))
                .sender(mappedSender)
                .type(msg.getType())
                .text(textVal)
                .mediaUrl("image".equals(msg.getType()) ? msg.getContent() : null)
                .time(timeStr)
                .timestamp(timestampVal)
                .fileName(msg.getFileName())
                .fileSize(msg.getFileSize())
                .locationName(msg.getLocationName())
                .mapUrl(msg.getMapUrl())
                .contactName(msg.getContactName())
                .contactPhone(msg.getContactPhone())
                .phone(msg.getContactPhone())
                .contactAvatar(msg.getContactAvatar())
                .build();
    }

    public List<org.example.agrimarket.dto.SuggestFarmerResponseDTO> suggestFarmers(String query) {
        List<Farmer> farmers;
        if (query == null || query.trim().isEmpty()) {
            farmers = farmerRepository.findAll().stream().limit(6).collect(Collectors.toList());
        } else {
            farmers = farmerRepository.searchFarmers(query.trim());
        }

        return farmers.stream().map(f -> org.example.agrimarket.dto.SuggestFarmerResponseDTO.builder()
                .id(String.valueOf(f.getId()))
                .name(f.getFarmName() != null && !f.getFarmName().isEmpty() ? f.getFarmName() : f.getFullName())
                .avatar(f.getAvatarUrl() != null ? f.getAvatarUrl() : "https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=150")
                .phone(f.getPhone())
                .farmAddress(f.getFarmAddress())
                .activeState("Đang hoạt động")
                .verified("verified".equalsIgnoreCase(f.getVerificationStatus()))
                .isOnline(true)
                .build()
        ).collect(Collectors.toList());
    }

    public ConversationResponseDTO toggleBlock(Long conversationId, String email) {
        Conversation conv = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Cuộc hội thoại không tồn tại"));

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Tài khoản không tìm thấy"));

        String userRole = null;
        if (conv.getFarmer().getId().equals(user.getId())) {
            userRole = "farmer";
        } else if (conv.getCustomer().getId().equals(user.getId())) {
            userRole = "customer";
        } else {
            throw new RuntimeException("Bạn không phải thành viên của cuộc hội thoại này");
        }

        if (conv.getBlockedBy() != null) {
            if (conv.getBlockedBy().equals(userRole)) {
                conv.setBlockedBy(null);
            } else {
                throw new RuntimeException("Bạn không thể bỏ chặn cuộc hội thoại này.");
            }
        } else {
            conv.setBlockedBy(userRole);
        }

        conversationRepository.save(conv);
        return mapToConversationDTO(conv, user.getId(), userRole);
    }

    @org.springframework.transaction.annotation.Transactional
    public void deleteConversation(Long conversationId, String email) {
        Conversation conv = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Cuộc hội thoại không tồn tại"));

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Tài khoản không tìm thấy"));

        if (!conv.getFarmer().getId().equals(user.getId()) && !conv.getCustomer().getId().equals(user.getId())) {
            throw new RuntimeException("Bạn không phải thành viên của cuộc hội thoại này");
        }

        chatMessageRepository.deleteAllByConversationId(conversationId);
        conversationRepository.delete(conv);
    }
}
