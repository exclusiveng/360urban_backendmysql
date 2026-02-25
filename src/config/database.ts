import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import { User } from '../entities/User.js';
import { Property } from '../entities/Property.js';
import { PropertyImage } from '../entities/PropertyImage.js';
import { Area } from '../entities/Area.js';
import { ContactInquiry } from '../entities/ContactInquiry.js';
import { Favorite } from '../entities/Favorite.js';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'mysql',
  ...(process.env.DATABASE_URL
    ? { url: process.env.DATABASE_URL }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306', 10),
        username: process.env.DB_USERNAME || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || '360urban_db',
        connectTimeout: 30000,
      }),
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
  entities: [User, Property, PropertyImage, Area, ContactInquiry, Favorite],
  migrations: ['dist/migrations/*.js'],
  subscribers: [],
  connectorPackage: 'mysql2',
});
