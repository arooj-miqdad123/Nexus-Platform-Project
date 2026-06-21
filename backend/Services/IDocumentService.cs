using Microsoft.AspNetCore.Http; // IFormFile ke liye zaroori hai
using NexusBackend.Models;       // Is se Document model mil jaye ga
using NexusBackend.Models.DTOs;

namespace NexusBackend.Services; // C# 10+ file-scoped namespace style

public interface IDocumentService
{
    Task<Document> UploadDocumentAsync(int userId, IFormFile file, string title, string? description);
    Task<IEnumerable<Document>> GetUserDocumentsAsync(int userId);
    Task<Document?> GetDocumentAsync(int id);
    Task<bool> AddSignatureAsync(int documentId, int userId, IFormFile signatureImage);
}