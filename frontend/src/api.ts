// src/api.ts
const BASE_URL: string = "http://localhost:5243"; // Local development ke liye strictly http

// Token localStorage se lena
const getToken = (): string | null => localStorage.getItem("nexus_token");

// Helper function ke liye interfaces
interface ApiOptions {
    method: string;
    headers: Record<string, string>;
    body?: string;
}

// Generic Helper function — any hata kar unknown/T use kiya ha
const apiCall = async <T = unknown>(
    endpoint: string,
    method: string = "GET",
    body: unknown = null
): Promise<T> => {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const config: ApiOptions = { method, headers };
    if (body) config.body = JSON.stringify(body);

    const res = await fetch(`${BASE_URL}${endpoint}`, config);
    const data = await res.json();

    if (!res.ok) throw new Error(data.message || "Something went wrong");
    return data as T;
};

// ===== AUTH =====
// NOTE: Agar backend par signup ha tou niche "/api/auth/register" ko badal kar "/api/auth/signup" kar dein.
export const registerUser = (fullName: string, email: string, password: string, role: string): Promise<unknown> =>
    apiCall("/api/auth/register", "POST", { fullName, email, password, role });

export const loginUser = (email: string, password: string): Promise<unknown> =>
    apiCall("/api/auth/login", "POST", { email, password });

export const getMyProfile = (): Promise<unknown> =>
    apiCall("/api/auth/profile");

export const updateProfile = (data: Record<string, unknown>): Promise<unknown> =>
    apiCall("/api/auth/profile", "PUT", data);

// ===== MEETINGS =====
export const scheduleMeeting = (data: Record<string, unknown>): Promise<unknown> =>
    apiCall("/api/meeting", "POST", data);

export const getMyMeetings = (): Promise<unknown> =>
    apiCall("/api/meeting");

export const updateMeetingStatus = (id: string | number, status: string): Promise<unknown> =>
    apiCall(`/api/meeting/${id}/status`, "PUT", { status });

// ===== DOCUMENTS =====
export const getMyDocuments = (): Promise<unknown> =>
    apiCall("/api/document");

export const uploadDocument = async (file: File, title: string, description: string = ""): Promise<unknown> => {
    const token = getToken();
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    formData.append("description", description);

    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${BASE_URL}/api/document/upload`, {
        method: "POST",
        headers: headers,
        body: formData,
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Upload failed");
    return data;
};

export const signDocument = async (docId: string | number, signatureImageFile: File): Promise<unknown> => {
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
export const createPayment = (amount: number, currency: string = "usd", description: string = ""): Promise<unknown> =>
    apiCall("/api/payment/create", "POST", { amount, currency, description });

export const confirmPayment = (transactionId: string | number): Promise<unknown> =>
    apiCall(`/api/payment/confirm/${transactionId}`, "POST");

export const getTransactions = (): Promise<unknown> =>
    apiCall("/api/payment/transactions");