namespace NexusBackend.Helpers
{
    public class FileUploadHelper
    {
        private readonly IWebHostEnvironment _env;

        public FileUploadHelper(IWebHostEnvironment env)
        {
            _env = env;
        }

        public async Task<string> SaveFileAsync(IFormFile file, string folderName)
        {
            var uploadsFolder = Path.Combine(_env.WebRootPath ?? "wwwroot", folderName);
            if (!Directory.Exists(uploadsFolder))
                Directory.CreateDirectory(uploadsFolder);

            var fileName = $"{Guid.NewGuid()}_{file.FileName}";
            var filePath = Path.Combine(uploadsFolder, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            return $"/{folderName}/{fileName}";
        }

        public bool DeleteFile(string filePath)
        {
            var fullPath = Path.Combine(_env.WebRootPath ?? "wwwroot", filePath.TrimStart('/'));
            if (File.Exists(fullPath))
            {
                File.Delete(fullPath);
                return true;
            }
            return false;
        }

        public bool IsValidImage(IFormFile file)
        {
            var allowedTypes = new[] { "image/jpeg", "image/png", "image/gif", "image/webp" };
            return allowedTypes.Contains(file.ContentType) && file.Length <= 5 * 1024 * 1024; // 5MB max
        }

        public bool IsValidDocument(IFormFile file)
        {
            var allowedTypes = new[]
            {
                "application/pdf",
                "application/msword",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                "text/plain"
            };
            return allowedTypes.Contains(file.ContentType) && file.Length <= 10 * 1024 * 1024; // 10MB max
        }
    }
}