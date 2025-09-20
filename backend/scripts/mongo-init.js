// MongoDB initialization script
db = db.getSiblingDB('taskmanager');

// Create user for the application
db.createUser({
  user: 'taskmanager',
  pwd: 'taskmanager123',
  roles: [
    {
      role: 'readWrite',
      db: 'taskmanager'
    }
  ]
});

// Create collections with validation
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'email', 'password'],
      properties: {
        name: {
          bsonType: 'string',
          minLength: 2,
          maxLength: 50
        },
        email: {
          bsonType: 'string',
          pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'
        },
        password: {
          bsonType: 'string',
          minLength: 8
        }
      }
    }
  }
});

db.createCollection('tasks', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['title', 'userId'],
      properties: {
        title: {
          bsonType: 'string',
          minLength: 1
        },
        description: {
          bsonType: 'string'
        },
        status: {
          bsonType: 'string',
          enum: ['pending', 'in_progress', 'completed']
        },
        priority: {
          bsonType: 'string',
          enum: ['low', 'medium', 'high']
        },
        userId: {
          bsonType: 'objectId'
        }
      }
    }
  }
});

// Create indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.tasks.createIndex({ userId: 1 });
db.tasks.createIndex({ status: 1 });
db.tasks.createIndex({ priority: 1 });
db.tasks.createIndex({ createdAt: 1 });

print('Database initialized successfully!');
