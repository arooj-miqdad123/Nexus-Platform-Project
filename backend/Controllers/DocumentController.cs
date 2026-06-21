using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NexusBackend.Services;

namespace NexusBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DocumentController : ControllerBase
    {
        private readonly IDocumentService _documentService;

        public DocumentController(IDocumentService documentService)
        {
            _documentService = documentService;
        }

        [HttpPost("upload")]
        public async Task<IActionResult> UploadDocument(IFormFile file, [FromForm] string title, [FromForm] string? description)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { success = false, message = "No file uploaded" });

            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);
            var document = await _documentService.UploadDocumentAsync(userId, file, title, description);

            return Ok(new { success = true, data = document });
        }

        [HttpGet]
        public async Task<IActionResult> GetMyDocuments()
        {
            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);
            var documents = await _documentService.GetUserDocumentsAsync(userId);
            return Ok(new { success = true, data = documents });
        }

        [HttpPost("{id}/sign")]
        public async Task<IActionResult> AddSignature(int id, IFormFile signatureImage)
        {
            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);
            var result = await _documentService.AddSignatureAsync(id, userId, signatureImage);
            return result
                ? Ok(new { success = true, message = "Document signed successfully" })
                : BadRequest(new { success = false, message = "Failed to sign document" });
        }
    }
}