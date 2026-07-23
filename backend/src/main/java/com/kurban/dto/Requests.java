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

    // Landing sayfasındaki "Bilgi Al" formu. Kimlik doğrulaması olmayan bir
    // uçtan geldiği için alan uzunlukları sınırlı tutuluyor.
    public static class ContactRequest {
        @NotBlank(message = "Ad Soyad zorunlu")
        @Size(max = 120, message = "Ad Soyad çok uzun")
        public String name;
        @NotBlank(message = "Telefon zorunlu")
        @Size(max = 30, message = "Telefon çok uzun")
        public String phone;
        @NotBlank(message = "E-posta zorunlu")
        @Email(message = "Geçerli bir e-posta girin")
        @Size(max = 180, message = "E-posta çok uzun")
        public String email;
        @NotBlank(message = "Mesaj zorunlu")
        @Size(max = 2000, message = "Mesaj en fazla 2000 karakter olabilir")
        public String message;
    }
}
