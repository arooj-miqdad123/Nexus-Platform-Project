using System.ComponentModel.DataAnnotations;

namespace NexusBackend.Models
{
    public enum DocumentStatus
    {
        Draft,
        PendingSignature,
        Signed,
        Archived
    }

    public class Document
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Title { get; set; } = string.Empty;

        public string? Description { get; set; }

        [Required]
        public string FileUrl { get; set; } = string.Empty;

        [Required]
        public string FileName { get; set; } = string.Empty;

        public string? FileType { get; set; }
        public long FileSize { get; set; }

        public DocumentStatus Status { get; set; } = DocumentStatus.Draft;

        public string? SignatureUrl { get; set; }
        public DateTime? SignedAt { get; set; }

        // Foreign Key
        public int UploadedById { get; set; }
        public User UploadedBy { get; set; } = null!;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}