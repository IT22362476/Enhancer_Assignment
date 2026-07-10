using Microsoft.EntityFrameworkCore;
using PurchaseBillAPI.Models;

namespace PurchaseBillAPI.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<LocationDetail> Location_Details { get; set; }
    public DbSet<PurchaseItem> Purchase_Items { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<PurchaseItem>(entity =>
        {
            entity.Property(e => e.StandardCost).HasColumnType("decimal(18,2)");
            entity.Property(e => e.StandardPrice).HasColumnType("decimal(18,2)");
            entity.Property(e => e.Quantity).HasColumnType("decimal(18,2)");
            entity.Property(e => e.Discount).HasColumnType("decimal(18,2)");
            entity.Property(e => e.TotalCost).HasColumnType("decimal(18,2)");
            entity.Property(e => e.TotalSelling).HasColumnType("decimal(18,2)");
        });
    }
}
