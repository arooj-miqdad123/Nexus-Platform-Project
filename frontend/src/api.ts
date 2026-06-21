// src/api.ts

const BASE_URL: string = "httph://localhost:5243"; // local ke liye
// Deploy hone ke baad: const BASE_URL = "https://localhost:5243";

// Token localStorage se lena (Return type string ya null ho sakti hai)
const getToken = (): string | null => localStorage.getItem("nexus_token");

// Helper function ke liye interfaces
interface ApiOptions {
    method: string;
    headers: Record<string, string>;
    body?: string;
}

// Helper function — har API call ke liye
const apiCall = async (endpoint: string, method: string = "GET", body: any = null): Promise<any> => {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const config: ApiOptions = { method, headers };
    if (body) config.body = JSON.stringify(body);

    const res = await fetch(`${BASE_URL}${endpoint}`, config);
    const data = await res.json();

    if (!res.ok) throw new Error(data.message || "Something went wrong");
    return data;
};

// ===== AUTH =====
export const registerUser = (fullName: string, email: string, password: string, role: string): Promise<any> =>
    apiCall("/api/auth/register", "POST", { fullName, email, password, role });

export const loginUser = (email: string, password: string): Promise<any> =>
    apiCall("/api/auth/login", "POST", { email, password });

export const getMyProfile = (): Promise<any> =>
    apiCall("/api/auth/profile");

export const updateProfile = (data: any): Promise<any> =>
    apiCall("/api/auth/profile", "PUT", data);

// ===== MEETINGS =====
export const scheduleMeeting = (data: any): Promise<any> =>
    apiCall("/api/meeting", "POST", data);

export const getMyMeetings = (): Promise<any> =>
    apiCall("/api/meeting");

export const updateMeetingStatus = (id: string | number, status: string): Promise<any> =>
    apiCall(`/api/meeting/${id}/status`, "PUT", { status });

// ===== DOCUMENTS =====
export const getMyDocuments = (): Promise<any> =>
    apiCall("/api/document");

export const uploadDocument = async (file: File, title: string, description: string = ""): Promise<any> => {
    const token = getToken();
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    formData.append("description", description);

    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${BASE_URL}/api/document/upload`, {
        method: "POST",
        headers: headers, // Fetch FormData ke sath Content-Type khud set karta hai
        body: formData,
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Upload failed");
    return data;
};

export const signDocument = async (docId: string | number, signatureImageFile: File): Promise<any> => {
    const token = getToken();
    const formData = new FormData();
    formData.append("signatureImage", signatureImageFile);

    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${BASE_URL}/api/document/${docId}/sign`, {
        method: "POST",
        headers: headers,
        body: formData,
    });
    return res.json();
};

// ===== PAYMENTS =====
export const createPayment = (amount: number, currency: string = "usd", description: string = ""): Promise<any> =>
    apiCall("/api/payment/create", "POST", { amount, currency, description });

export const confirmPayment = (transactionId: string | number): Promise<any> =>
    apiCall(`/api/payment/confirm/${transactionId}`, "POST");

export const getTransactions = (): Promise<any> =>
    apiCall("/api/payment/transactions");