package org.example.agrimarket.dto;

public class FarmerRegistrationRequest {
    private String farmName;
    private String farmAddress;
    private String description;

    public FarmerRegistrationRequest() {}

    public FarmerRegistrationRequest(String farmName, String farmAddress, String description) {
        this.farmName = farmName;
        this.farmAddress = farmAddress;
        this.description = description;
    }

    public String getFarmName() {
        return farmName;
    }

    public void setFarmName(String farmName) {
        this.farmName = farmName;
    }

    public String getFarmAddress() {
        return farmAddress;
    }

    public void setFarmAddress(String farmAddress) {
        this.farmAddress = farmAddress;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
