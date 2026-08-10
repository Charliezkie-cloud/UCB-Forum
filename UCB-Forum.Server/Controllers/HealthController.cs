using Microsoft.AspNetCore.Mvc;

namespace UCB_Forum.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    [HttpGet]
    public ActionResult<object> Get()
    {
        return Ok(new { status = "healthy", service = "UCB Forum API" });
    }
}
