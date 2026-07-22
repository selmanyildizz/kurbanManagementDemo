package com.kurban.dto;

import jakarta.validation.constraints.*;

public class Requests {

    public static class KurbanCreate {
        @NotBlank(message = "İsim zorunlu")
        public String name;
        @NotBlank(message = "Telefon zorunlu")
        public String phone;
        @Email(message = "Geçerli bir e-posta girin")
        public String email;
        @Min(1) @Max(7)
        public int shares = 7;
        public String note;
    }

    public static class CheckinRequest {
        @NotBlank
        public String token;
    }

    public static class StationCreate {
        @NotBlank
        public String name;
    }

    public static class LoginRequest {
        @NotBlank(message = "Kullanıcı adı zorunlu")
        public String username;
        @NotBlank(message = "Şifre zorunlu")
        public String password;
    }

    public static class StaffUserCreate {
        @NotBlank(message = "Kullanıcı adı zorunlu")
        public String username;
        @NotBlank(message = "Şifre zorunlu")
        public String password;
        @NotBlank(message = "Ad Soyad zorunlu")
        public String displayName;
    }
}
