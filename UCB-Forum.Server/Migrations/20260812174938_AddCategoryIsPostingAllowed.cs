using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace UCBForum.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddCategoryIsPostingAllowed : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsPostingAllowed",
                table: "Categories",
                type: "bit",
                nullable: false,
                defaultValue: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsPostingAllowed",
                table: "Categories");
        }
    }
}
