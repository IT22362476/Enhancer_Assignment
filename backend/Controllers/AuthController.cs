using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PurchaseBillAPI.Data;
using PurchaseBillAPI.Models;
using System.Text.Json;

namespace PurchaseBillAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly HttpClient _httpClient;

    public AuthController(AppDbContext db, IHttpClientFactory httpClientFactory)
    {
        _db = db;
        _httpClient = httpClientFactory.CreateClient();
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var payload = new
        {
            API_Action = "GetLoginData",
            Device_Id = "D001",
            Sync_Time = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss"),
            Company_Code = request.Email,
            API_Body = new
            {
                Username = request.Email,
                Pw = request.Password
            }
        };

        var jsonContent = new StringContent(JsonSerializer.Serialize(payload), System.Text.Encoding.UTF8, "application/json");

        try
        {
            var response = await _httpClient.PostAsync(
                "https://ez-staging-api.azurewebsites.net/api/External_Api/POS_Api/Invoke",
                jsonContent);

            var responseBody = await response.Content.ReadAsStringAsync();

            using var doc = JsonDocument.Parse(responseBody);
            var root = doc.RootElement;

            // Check Status_Code from response body (API always returns HTTP 200)
            if (!root.TryGetProperty("Status_Code", out var statusCodeEl) || statusCodeEl.GetInt32() != 200)
            {
                // Try to extract detailed error message from API response
                var errorMsg = "Login failed. Invalid credentials.";
                if (root.TryGetProperty("Message", out var msgEl))
                {
                    errorMsg = msgEl.GetString() ?? errorMsg;
                }
                else if (root.TryGetProperty("message", out var msgEl2))
                {
                    errorMsg = msgEl2.GetString() ?? errorMsg;
                }
                return Unauthorized(new { success = false, message = errorMsg });
            }

            // Parse User_Locations from Response_Body
            JsonElement.ArrayEnumerator? userLocations = null;

            if (root.TryGetProperty("Response_Body", out var responseBodyEl))
            {
                // Handle both array and single object formats
                if (responseBodyEl.ValueKind == JsonValueKind.Array && responseBodyEl.GetArrayLength() > 0)
                {
                    var firstItem = responseBodyEl[0];
                    if (firstItem.TryGetProperty("User_Locations", out var locs))
                    {
                        userLocations = locs.EnumerateArray();
                    }
                }
                else if (responseBodyEl.ValueKind == JsonValueKind.Object)
                {
                    if (responseBodyEl.TryGetProperty("User_Locations", out var locs))
                    {
                        userLocations = locs.EnumerateArray();
                    }
                }
            }

            if (userLocations.HasValue)
            {
                // Efficiently clear existing locations
                await _db.Location_Details.ExecuteDeleteAsync();

                foreach (var loc in userLocations.Value)
                {
                    _db.Location_Details.Add(new LocationDetail
                    {
                        Location_Code = loc.GetProperty("Location_Code").GetString() ?? "",
                        Location_Name = loc.GetProperty("Location_Name").GetString() ?? ""
                    });
                }
                await _db.SaveChangesAsync();

                var locationList = await _db.Location_Details
                    .Select(l => new { l.Location_Code, l.Location_Name })
                    .ToListAsync();

                return Ok(new { success = true, message = "Login successful", User_Locations = locationList });
            }

            return Unauthorized(new { success = false, message = "Login failed. No locations found." });
        }
        catch (HttpRequestException ex)
        {
            return StatusCode(503, new { success = false, message = $"Unable to reach authentication server: {ex.Message}" });
        }
        catch (JsonException ex)
        {
            return StatusCode(502, new { success = false, message = $"Invalid response from authentication server: {ex.Message}" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = $"An unexpected error occurred: {ex.Message}" });
        }
    }
}
