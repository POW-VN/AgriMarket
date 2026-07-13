import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class TestConn {
    public static void main(String[] args) {
        String url = "jdbc:postgresql://aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres";
        String user = "postgres.bwrzbzwbpiczdsuzbbcq";
        String password = "Baohung04042005@";

        try {
            System.out.println("Connecting to database...");
            Connection conn = DriverManager.getConnection(url, user, password);
            System.out.println("Connected successfully!");
            conn.close();
        } catch (SQLException e) {
            System.err.println("Connection failed:");
            e.printStackTrace();
        }
    }
}
