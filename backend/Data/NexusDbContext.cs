using Microsoft.EntityFrameworkCore;
using NexusBackend.Models;

namespace NexusBackend.Data
{
    public class NexusDbContext : DbContext
    {
        public NexusDbContext(DbContextOptions<NexusDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Meeting> Meetings { get; set; }
        public DbSet<Document> Documents { get; set; }
        public DbSet<Transaction> Transactions { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Meeting relationships
            modelBuilder.Entity<Meeting>()
                .HasOne(m => m.Host)
                .WithMany(u => u.MeetingsAsHost)
                .HasForeignKey(m => m.HostId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Meeting>()
                .HasOne(m => m.Participant)
                .WithMany(u => u.MeetingsAsParticipant)
                .HasForeignKey(m => m.ParticipantId)
                .OnDelete(DeleteBehavior.Restrict);

            // Document relationship
            modelBuilder.Entity<Document>()
                .HasOne(d => d.UploadedBy)
                .WithMany(u => u.Documents)
                .HasForeignKey(d => d.UploadedById);

            // Transaction relationship
            modelBuilder.Entity<Transaction>()
                .HasOne(t => t.User)
                .WithMany(u => u.Transactions)
                .HasForeignKey(t => t.UserId);
        }
    }
}