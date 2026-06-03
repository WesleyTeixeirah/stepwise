using MongoDB.Driver;
using StepWise.API.Config;
using StepWise.API.Models;
using Microsoft.Extensions.Options;
using StepWise.API.Repositories;

namespace StepWise.API.Repositories
{
    public class TaskRepository : ITaskRepository
    {
        private readonly IMongoCollection<TaskItem> _tasks;

        public TaskRepository(IOptions<MongoDbSettings> settings)
        {
            if (settings?.Value == null)
                throw new Exception("MongoDbSettings não carregado");
        
            var client = new MongoClient(settings.Value.ConnectionString);
            var database = client.GetDatabase(settings.Value.DatabaseName);
        
            _tasks = database.GetCollection<TaskItem>("tasks");
        }

        public async Task<List<TaskItem>> GetByUserIdAsync(string userId)
        {
            return await _tasks.Find(t => t.UserId == userId).ToListAsync();
        }

        public async Task<TaskItem?> GetByIdAsync(string id)
        {
            return await _tasks.Find(t => t.Id == id).FirstOrDefaultAsync();
        }

        public async Task CreateAsync(TaskItem task)
        {
            await _tasks.InsertOneAsync(task);
        }

        public async Task UpdateAsync(string id, TaskItem task)
        {
            await _tasks.ReplaceOneAsync(t => t.Id == id, task);
        }

        public async Task DeleteAsync(string id)
        {
            await _tasks.DeleteOneAsync(t => t.Id == id);
        }
    }
}
