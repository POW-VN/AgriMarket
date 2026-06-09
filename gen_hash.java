import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class gen_hash {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String hash = encoder.encode("admin123");
        System.out.println("HASH:" + hash);
    }
}
