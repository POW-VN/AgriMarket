package org.example.agrimarket.controller;

import org.example.agrimarket.dto.ChatMessageResponseDTO;
import org.example.agrimarket.dto.SendChatMessageDTO;
import org.example.agrimarket.service.ChatMessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/support-requests/{requestId}/messages")
public class ChatMessageController {

    @Autowired
    private ChatMessageService chatMessageService;

    @GetMapping
    public ResponseEntity<?> getMessages(@PathVariable Long requestId, Principal principal, Authentication authentication) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Vui lòng đăng nhập");
        }
        try {
            String role = "customer";
            if (authentication != null && authentication.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
                role = "admin";
            }
            List<ChatMessageResponseDTO> messages = chatMessageService.getMessages(requestId, principal.getName(), role);
            return ResponseEntity.ok(messages);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<?> sendMessage(@PathVariable Long requestId, @RequestBody SendChatMessageDTO dto, Principal principal, Authentication authentication) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Vui lòng đăng nhập");
        }
        if (dto.getContent() == null || dto.getContent().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Nội dung tin nhắn không thể bỏ trống");
        }
        try {
            String role = "customer";
            if (authentication != null && authentication.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
                role = "admin";
            }
            ChatMessageResponseDTO response = chatMessageService.sendMessage(requestId, principal.getName(), role, dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
