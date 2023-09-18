// Import necessary modules and dependencies
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as jwt from 'jsonwebtoken';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';

// Define the UserService class and mark it as injectable using the @Injectable() decorator
@Injectable()
export class UserService {
  // Declare private variables for JWT secret and upload folder path
  private JWT_SECRET: string | any;
  private readonly uploadFolder = 'uploads';

  // Constructor initializes the PrismaService and JWT_SECRET
  constructor(private readonly prisma: PrismaService) {
    this.JWT_SECRET = process.env.JWT_SECRET;

    // Check if JWT_SECRET is set, otherwise throw an error
    if (!this.JWT_SECRET) {
      throw new Error('JWT_SECRET environment variable not set!');
    }
  }

  // handleProfileSetup method takes userCookie, profileName, and profileImage as arguments
  async handleProfileSetup(userCookie: string, profileName: string, profileImage: any): Promise<any> {
    // Declare a variable to store the decoded JWT token
    let decodedToken;

    // Try to decode the JWT token using the JWT_SECRET
    try {
      decodedToken = jwt.verify(userCookie, this.JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid token.');
    }

    // Declare a variable to store the email from the decoded token
    let resultEmail: string | undefined;

    // Check if the decoded token is an object and has an email property
    if (typeof decodedToken === 'object' && decodedToken !== null) {
      resultEmail = decodedToken.email;
    } else {
      throw new Error('Invalid token format backend(handleProfileSetup).\n');
    }

    // Fetch the user from the database using the PrismaService and the email from the decoded token
    const user = await this.prisma.user.findUnique({ where: { username: resultEmail } });

    // Check if the user exists, otherwise throw an error
    if (!user) {
      throw new Error('User not found.');
    }

    // Get the file extension of the profile image
    const fileExtension = extname(profileImage.originalname);

    // Generate a unique filename using uuidv4 and the file extension
    const uniqueFilename = uuidv4() + fileExtension;

    // Construct the file path for the profile image in the upload folder
    const filePath = `${this.uploadFolder}/${uniqueFilename}`;

    // Save the profile image to the local folder using the saveImageToLocalFolder method
    await this.saveImageToLocalFolder(profileImage, filePath);

    // Update the user profile in the database using the PrismaService
    const userProfile = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        username: profileName,
        profileImageUrl: filePath,
      },
    });

    // Return the updated user profile
    return userProfile;
  }

  // saveImageToLocalFolder method takes a file and a file path as arguments
  private async saveImageToLocalFolder(file: Express.Multer.File, filePath: string): Promise<void> {
    // Import the 'fs' module to work with the file system
    const fs = require('fs');

    // Create a write stream to write the file buffer to the specified file path
    const writeStream = fs.createWriteStream(filePath);

    // Write the file buffer to the write stream
    writeStream.write(file.buffer);

    // End the write stream
    writeStream.end();
  }
}
