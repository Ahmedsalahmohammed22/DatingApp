using System.ComponentModel.DataAnnotations;

namespace DatingApp.Models
{
    public class AppUser
    {
        public int Id { get; set; }
        [Required]
        public string Name { get; set; }
        public byte[] PasswordHash { get; set; }
        public byte[] PasswordSalt { get; set; }
    }
}
