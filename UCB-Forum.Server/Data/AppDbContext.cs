using Microsoft.EntityFrameworkCore;
using UCB_Forum.Server.Models;

namespace UCB_Forum.Server.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Profile> Profiles => Set<Profile>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Post> Posts => Set<Post>();
    public DbSet<PostLike> PostLikes => Set<PostLike>();
    public DbSet<Reputation> Reputations => Set<Reputation>();
    public DbSet<Notification> Notifications => Set<Notification>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("Users");
            entity.HasKey(e => e.UserId);

            entity.Property(e => e.UserId)
                .ValueGeneratedOnAdd();

            entity.Property(e => e.CreatedAt)
                .HasColumnType("datetime2")
                .IsRequired();

            entity.Property(e => e.Email)
                .HasColumnType("varchar(254)")
                .HasMaxLength(254)
                .IsRequired();

            entity.HasIndex(e => e.Email)
                .IsUnique();

            entity.Property(e => e.Password)
                .HasColumnType("varbinary(64)")
                .IsRequired();

            entity.Property(e => e.UserRoleCode)
                .IsRequired()
                .HasDefaultValue((int)UserRole.Guest);

            entity.HasOne(e => e.Profile)
                .WithOne(p => p.User)
                .HasForeignKey<Profile>(p => p.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Profile>(entity =>
        {
            entity.ToTable("Profiles");
            entity.HasKey(e => e.ProfileId);

            entity.Property(e => e.ProfileId)
                .ValueGeneratedOnAdd();

            entity.Property(e => e.CreatedAt)
                .HasColumnType("datetime2")
                .IsRequired();

            entity.Property(e => e.UpdatedAt)
                .HasColumnType("datetime2")
                .IsRequired();

            entity.Property(e => e.UserId)
                .IsRequired();

            entity.HasIndex(e => e.UserId)
                .IsUnique();

            entity.Property(e => e.Username)
                .HasColumnType("nvarchar(255)")
                .HasMaxLength(255)
                .IsRequired();

            entity.Property(e => e.Bio)
                .HasColumnType("nvarchar(500)")
                .HasMaxLength(500);

            entity.Property(e => e.AvatarUrl)
                .HasColumnType("varchar(2048)")
                .HasMaxLength(2048);

            entity.Property(e => e.Facebook)
                .HasColumnType("nvarchar(100)")
                .HasMaxLength(100);

            entity.Property(e => e.Instagram)
                .HasColumnType("nvarchar(100)")
                .HasMaxLength(100);

            entity.Property(e => e.Twitter)
                .HasColumnType("nvarchar(100)")
                .HasMaxLength(100);

            entity.Property(e => e.Tiktok)
                .HasColumnType("nvarchar(100)")
                .HasMaxLength(100);

            entity.Property(e => e.IsVerifiedStudent)
                .HasDefaultValue(false);

            entity.Property(e => e.Program)
                .HasColumnType("nvarchar(100)")
                .HasMaxLength(100);

            entity.Property(e => e.YearLevel)
                .HasColumnType("tinyint");

            entity.Property(e => e.IsVerifiedTeacher)
                .HasDefaultValue(false);

            entity.Property(e => e.Department)
                .HasColumnType("nvarchar(100)")
                .HasMaxLength(100);

            entity.Property(e => e.Reputation)
                .HasDefaultValue(0);
        });

        modelBuilder.Entity<Category>(entity =>
        {
            entity.ToTable("Categories");
            entity.HasKey(e => e.CategoryId);

            entity.Property(e => e.CategoryId)
                .ValueGeneratedOnAdd();

            entity.Property(e => e.CreatedAt)
                .HasColumnType("datetime2")
                .IsRequired();

            entity.Property(e => e.Name)
                .HasColumnType("nvarchar(100)")
                .HasMaxLength(100)
                .IsRequired();

            entity.Property(e => e.Slug)
                .HasColumnType("varchar(120)")
                .HasMaxLength(120)
                .IsRequired();

            entity.HasIndex(e => e.Slug)
                .IsUnique();

            entity.Property(e => e.Description)
                .HasColumnType("nvarchar(255)")
                .HasMaxLength(255);

            entity.Property(e => e.IconClass)
                .HasColumnType("varchar(50)")
                .HasMaxLength(50);

            entity.Property(e => e.DisplayOrder)
                .HasDefaultValue(0);

            entity.Property(e => e.IsRestricted)
                .HasDefaultValue(false);

            entity.Property(e => e.IsPostingAllowed)
                .HasDefaultValue(true);

            entity.Property(e => e.IsActive)
                .HasDefaultValue(true);

            entity.HasOne(e => e.ParentCategory)
                .WithMany(e => e.ChildCategories)
                .HasForeignKey(e => e.ParentCategoryId)
                .OnDelete(DeleteBehavior.NoAction);
        });

        modelBuilder.Entity<Post>(entity =>
        {
            entity.ToTable("Posts");
            entity.HasKey(e => e.PostId);

            entity.Property(e => e.PostId)
                .HasColumnName("PostID")
                .ValueGeneratedOnAdd();

            entity.Property(e => e.CategoryId)
                .IsRequired();

            entity.Property(e => e.AuthorId)
                .IsRequired();

            entity.Property(e => e.CreatedAt)
                .HasColumnType("datetime2")
                .IsRequired();

            entity.Property(e => e.UpdatedAt)
                .HasColumnType("datetime2")
                .IsRequired();

            entity.Property(e => e.Title)
                .HasColumnType("nvarchar(255)")
                .HasMaxLength(255);

            entity.Property(e => e.Content)
                .HasColumnType("nvarchar(max)")
                .IsRequired();

            entity.Property(e => e.IsPinned)
                .HasDefaultValue(false);

            entity.Property(e => e.IsDeleted)
                .HasDefaultValue(false);

            entity.Property(e => e.LikesCount)
                .HasDefaultValue(0);

            entity.HasOne(e => e.Category)
                .WithMany(c => c.Posts)
                .HasForeignKey(e => e.CategoryId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Author)
                .WithMany(u => u.Posts)
                .HasForeignKey(e => e.AuthorId)
                .OnDelete(DeleteBehavior.NoAction);

            entity.HasOne(e => e.ParentPost)
                .WithMany(p => p.Replies)
                .HasForeignKey(e => e.ParentPostId)
                .OnDelete(DeleteBehavior.NoAction);
        });

        modelBuilder.Entity<PostLike>(entity =>
        {
            entity.ToTable("PostLikes");
            entity.HasKey(e => new { e.PostId, e.UserId });

            entity.Property(e => e.CreatedAt)
                .HasColumnType("datetime2")
                .IsRequired();

            entity.HasOne(e => e.Post)
                .WithMany(p => p.PostLikes)
                .HasForeignKey(e => e.PostId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.User)
                .WithMany(u => u.PostLikes)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Reputation>(entity =>
        {
            entity.ToTable("Reputations");
            entity.HasKey(e => new { e.SourceUserId, e.TargetUserId });

            entity.Property(e => e.SourceUserId)
                .IsRequired();

            entity.Property(e => e.TargetUserId)
                .IsRequired();

            entity.Property(e => e.IsPositive)
                .IsRequired();

            entity.Property(e => e.CreatedAt)
                .HasColumnType("datetime2")
                .IsRequired();

            entity.Property(e => e.UpdatedAt)
                .HasColumnType("datetime2")
                .IsRequired();

            entity.HasOne(e => e.SourceUser)
                .WithMany(u => u.SentReputations)
                .HasForeignKey(e => e.SourceUserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.TargetUser)
                .WithMany(u => u.ReceivedReputations)
                .HasForeignKey(e => e.TargetUserId)
                .OnDelete(DeleteBehavior.NoAction);
        });

        modelBuilder.Entity<Notification>(entity =>
        {
            entity.ToTable("Notifications");
            entity.HasKey(e => e.NotificationId);

            entity.Property(e => e.NotificationId)
                .ValueGeneratedOnAdd();

            entity.Property(e => e.UserId)
                .IsRequired();

            entity.Property(e => e.CreatedAt)
                .HasColumnType("datetime2")
                .IsRequired();

            entity.Property(e => e.Type)
                .HasColumnType("tinyint")
                .IsRequired();

            entity.Property(e => e.Message)
                .HasColumnType("nvarchar(500)")
                .HasMaxLength(500)
                .IsRequired();

            entity.Property(e => e.IsRead)
                .HasDefaultValue(false);

            entity.HasOne(e => e.User)
                .WithMany(u => u.Notifications)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.RelatedPost)
                .WithMany(p => p.Notifications)
                .HasForeignKey(e => e.RelatedPostId)
                .OnDelete(DeleteBehavior.SetNull);
        });
    }
}

