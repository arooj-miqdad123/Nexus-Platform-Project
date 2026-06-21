using NexusBackend.Models;

namespace NexusBackend.Data
{
    public static class SeedData
    {
        public static void Initialize(NexusDbContext context)
        {
            // Ensure database is created
            context.Database.EnsureCreated();

            // Check if data already exists
            if (context.Users.Any())
                return; // DB already seeded

            // Seed Users
            var users = new List<User>
            {
                new User
                {
                    Email = "investor@nexus.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"),
                    FullName = "John Investor",
                    Role = UserRole.Investor,
                    Bio = "Experienced angel investor with 10+ years in tech startups",
                    CompanyName = "Venture Capital Partners",
                    InvestmentHistory = "Invested in 15+ startups including Uber, Airbnb",
                    PhoneNumber = "+1-555-0101",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                },
                new User
                {
                    Email = "entrepreneur@nexus.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"),
                    FullName = "Sarah Entrepreneur",
                    Role = UserRole.Entrepreneur,
                    Bio = "Founder of innovative AI startup",
                    CompanyName = "AI Solutions Inc",
                    StartupHistory = "Founded 2 successful startups, exited one in 2022",
                    PhoneNumber = "+1-555-0102",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                },
                new User
                {
                    Email = "demo@nexus.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("demo123"),
                    FullName = "Demo User",
                    Role = UserRole.Investor,
                    Bio = "Demo account for testing",
                    CompanyName = "Demo Corp",
                    PhoneNumber = "+1-555-0103",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                }
            };

            context.Users.AddRange(users);
            context.SaveChanges();

            // Seed Meetings
            var meetings = new List<Meeting>
            {
                new Meeting
                {
                    Title = "Initial Pitch Meeting",
                    Description = "Product demo and funding discussion",
                    StartTime = DateTime.UtcNow.AddDays(2),
                    EndTime = DateTime.UtcNow.AddDays(2).AddHours(1),
                    Status = MeetingStatus.Pending,
                    HostId = users[0].Id, // Investor
                    ParticipantId = users[1].Id, // Entrepreneur
                    MeetLink = $"https://meet.nexus.com/room-{Guid.NewGuid()}",
                    CreatedAt = DateTime.UtcNow
                },
                new Meeting
                {
                    Title = "Follow-up Discussion",
                    Description = "Term sheet review",
                    StartTime = DateTime.UtcNow.AddDays(5),
                    EndTime = DateTime.UtcNow.AddDays(5).AddHours(1),
                    Status = MeetingStatus.Accepted,
                    HostId = users[1].Id,
                    ParticipantId = users[0].Id,
                    MeetLink = $"https://meet.nexus.com/room-{Guid.NewGuid()}",
                    CreatedAt = DateTime.UtcNow
                }
            };

            context.Meetings.AddRange(meetings);

            // Seed Transactions
            var transactions = new List<Transaction>
            {
                new Transaction
                {
                    UserId = users[0].Id,
                    Type = TransactionType.Deposit,
                    Amount = 10000.00m,
                    Currency = "USD",
                    Status = TransactionStatus.Completed,
                    Description = "Initial deposit",
                    StripePaymentIntentId = "pi_mock_001",
                    CreatedAt = DateTime.UtcNow.AddDays(-10)
                },
                new Transaction
                {
                    UserId = users[1].Id,
                    Type = TransactionType.Deposit,
                    Amount = 5000.00m,
                    Currency = "USD",
                    Status = TransactionStatus.Completed,
                    Description = "Startup funding",
                    StripePaymentIntentId = "pi_mock_002",
                    CreatedAt = DateTime.UtcNow.AddDays(-5)
                }
            };

            context.Transactions.AddRange(transactions);
            context.SaveChanges();
        }
    }
}