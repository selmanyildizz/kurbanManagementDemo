package com.kurban.dto;

import jakarta.validation.constraints.*;

public class Requests {

    public static class KurbanCreate {
        @NotBlank(message = "İsim zorunlu")
        public String name;
        @NotBlank(message = "Telefon zorunlu")
        public String phone;
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
}
