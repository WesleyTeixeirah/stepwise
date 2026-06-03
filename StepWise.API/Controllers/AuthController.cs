using StepWise.API.DTOs;
using StepWise.API.Models;
using StepWise.API.Repositories;
using BCrypt.Net;

namespace StepWise.API.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepository;
        private readonly IConfiguration _config;

        public AuthService(IUserRepository userRepository, IConfiguration config)
        {
            _userRepository = userRepository ?? throw new Exception("UserRepository não injetado");
            _config = config ?? throw new Exception("Configuration não injetado");
        }

        public async Task<AuthResponseDTO?> RegisterAsync(RegisterDTO dto)
        {
            try
            {
                if (dto == null)
                    return null;

                var userExists = await _userRepository.GetByEmailAsync(dto.Email);
                if (userExists != null)
                    return null;

                var user = new User
                {
                    Nome = dto.Nome,
                    Email = dto.Email,
                    SenhaHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                    CriadoEm = DateTime.UtcNow
                };

                await _userRepository.CreateAsync(user);

                var token = GenerateToken(user);

                return new AuthResponseDTO
                {
                    Token = token,
                    Nome = user.Nome,
                    Email = user.Email
                };
            }
            catch (Exception ex)
            {
                Console.WriteLine("REGISTER ERROR: " + ex.Message);
                return null;
            }
        }

        public async Task<AuthResponseDTO?> LoginAsync(LoginDTO dto)
        {
            try
            {
                if (dto == null)
                    return null;

                var user = await _userRepository.GetByEmailAsync(dto.Email);
                if (user == null)
                    return null;

                if (!BCrypt.Net.BCrypt.Verify(dto.Password, user.SenhaHash))
                    return null;

                var token = GenerateToken(user);

                return new AuthResponseDTO
                {
                    Token = token,
                    Nome = user.Nome,
                    Email = user.Email
                };
            }
            catch (Exception ex)
            {
                Console.WriteLine("LOGIN ERROR: " + ex.Message);
                return null;
            }
        }

        private string GenerateToken(User user)
        {
            var secret = _config["Jwt:Secret"];

            if (string.IsNullOrEmpty(secret))
                throw new Exception("JWT Secret não configurado no appsettings");

            return "TOKEN_OK"; // substitui pelo seu JWT real
        }
    }
}
