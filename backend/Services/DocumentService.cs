using Microsoft.EntityFrameworkCore;
using NexusBackend.Data;
using NexusBackend.Models;

namespace NexusBackend.Services
{
    public class DocumentService : IDocumentService
    {
        private readonly NexusDbContext _context;
        private readonly IWebHostEnvironment _env;

        public DocumentService(NexusDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        public async Task<Document> UploadDocumentAsync(int userId, IFormFile file, string title, string? description)
        {
            var uploadsFolder = Path.Combine(_env.WebRootPath ?? "wwwroot", "documents");
            if (!Directory.Exists(uploadsFolder))
                Directory.CreateDirectory(uploadsFolder);

            var fileName = $"{Guid.NewGuid()}_{file.FileName}";
            var filePath = Path.Combine(uploadsFolder, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var document = new Document
            {
                Title = title,
                Description = description,
                FileName = file.FileName,
                FileUrl = $"/documents/{fileName}",
                FileType = file.ContentType,
                FileSize = file.Length,
                UploadedById = userId,
                Status = DocumentStatus.Draft
            };

            _context.Documents.Add(document);
            await _context.SaveChangesAsync();

            return document;
        }

        public async Task<IEnumerable<Document>> GetUserDocumentsAsync(int userId)
        {
            return await _context.Documents
                .Where(d => d.UploadedById == userId)
                .OrderByDescending(d => d.CreatedAt)
                .ToListAsync();
        }

        public async Task<Document?> GetDocumentAsync(int id)
        {
            return await _context.Documents.FindAsync(id);
        }

        public async Task<bool> AddSignatureAsync(int documentId, int userId, IFormFile signatureImage)
        {
            var document = await _context.Documents.FindAsync(documentId);
            if (document == null || document.UploadedById != userId) return false;

            var uploadsFolder = Path.Combine(_env.WebRootPath ?? "wwwroot", "signatures");
            if (!Directory.Exists(uploadsFolder))
                Directory.CreateDirectory(uploadsFolder);

            var fileName = $"sig_{documentId}_{Guid.NewGuid()}.png";
            var filePath = Path.Combine(uploadsFolder, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await signatureImage.CopyToAsync(stream);
            }

            document.SignatureUrl = $"/signatures/{fileName}";
            document.SignedAt = DateTime.UtcNow;
            document.Status = DocumentStatus.Signed;
            document.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }
    }
}