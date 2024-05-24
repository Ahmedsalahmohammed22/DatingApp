using AutoMapper;
using DatingApp.Data;
using DatingApp.DTOs;
using DatingApp.Interfaces;
using DatingApp.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;

namespace DatingApp.Controllers
{

    public class AccountsController : BaseApiController
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly ITokenService _tokenService;
        private readonly IUserRepository _userRepository;
        private readonly IMapper _mapper;

        public AccountsController(UserManager<AppUser> userManager , ITokenService tokenService , IUserRepository userRepository , IMapper mapper)
        {
            _userManager = userManager;
            _tokenService = tokenService;
            _userRepository = userRepository;
            _mapper = mapper;
        }

        [HttpPost("register")] // POST: api/Accounts/register
        public async Task<IActionResult> Register(RegisterDto registerDto)
        {
            if(await UserExists(registerDto.Name)) return BadRequest("Username is taken" + registerDto.Name);
            var user = _mapper.Map<AppUser>(registerDto);

            user.UserName = registerDto.Name.ToLower();
            var result = await _userManager.CreateAsync(user, registerDto.Password);
            if (!result.Succeeded) return BadRequest(result.Errors);
            var roleResult = await _userManager.AddToRoleAsync(user, "Member");
            if(!roleResult.Succeeded) return BadRequest(roleResult.Errors);
            return Ok(new UserDto
            {
                UserName = user.UserName,
                Token = await _tokenService.CreateToken(user),
                KnownAs = user.KnownAs,
                Gender = user.Gender
            });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto loginDto)
        {
            var user = await _userManager.Users.Include(p => p.Photos).SingleOrDefaultAsync(x => x.UserName == loginDto.UserName);
            if (user == null) return Unauthorized("Invalid Name");
            var result = await _userManager.CheckPasswordAsync(user , loginDto.Password);
            if (!result) return Unauthorized("Invalid password");
            return Ok(new UserDto
            {
                UserName = user.UserName,
                Token = await _tokenService.CreateToken(user),
                PhotoUrl = user.Photos.FirstOrDefault(x => x.IsMain)?.Url,
                KnownAs = user.KnownAs,
                Gender = user.Gender
            });

        }

        private async Task<bool> UserExists(string username)
        {
            return await _userManager.Users.AnyAsync(x => x.UserName == username.ToLower());
        }
    }
}
