using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PurchaseBillAPI.Data;
using PurchaseBillAPI.Models;

namespace PurchaseBillAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PurchaseController : ControllerBase
{
    private readonly AppDbContext _db;

    public PurchaseController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet("locations")]
    public async Task<IActionResult> GetLocations()
    {
        var locations = await _db.Location_Details
            .Select(l => new { l.Location_Code, l.Location_Name })
            .ToListAsync();
        return Ok(locations);
    }

    [HttpPost("items")]
    public async Task<IActionResult> AddItem([FromBody] PurchaseItem item)
    {
        item.TotalCost = (item.StandardCost * item.Quantity) - (item.StandardCost * item.Quantity * item.Discount / 100);
        item.TotalSelling = item.StandardPrice * item.Quantity;

        _db.Purchase_Items.Add(item);
        await _db.SaveChangesAsync();
        return Ok(new { success = true, item });
    }

    [HttpGet("items")]
    public async Task<IActionResult> GetItems()
    {
        var items = await _db.Purchase_Items.ToListAsync();
        return Ok(items);
    }
}
