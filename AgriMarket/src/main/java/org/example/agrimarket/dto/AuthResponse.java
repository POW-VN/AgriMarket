package org.example.agrimarket.dto;

public class AuthResponse {
    private String token;
    private Object user;

    public AuthResponse() {}

    public AuthResponse(String token, Object user) {
        this.token = token;
        this.user = user;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public Object getUser() {
        return user;
    }

    public void setUser(Object user) {
        this.user = user;
    }
}
