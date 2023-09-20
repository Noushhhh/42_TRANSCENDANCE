// Import necessary modules and dependencies
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import jwt from 'jsonwebtoken';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Payload } from '@prisma/client/runtime/library';
const ClamScan = require('clamscan').ClamScan;


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

  // ─────────────────────────────────────────────────────────────────────
  async decodeToken(token: string): Promise<any> {
    try {
      const decodedToken = jwt.verify(token, this.JWT_SECRET);
      return decodedToken;
    } catch (error) {
      throw new Error(`${error}` || 'Impossible to decode token');
    }

  }

  // ─────────────────────────────────────────────────────────────────────



  //Function to check if the publicName the user in trying to use already exists
  async hasProfileName(username: string): Promise<boolean> {
    const user: any = await this.prisma.user.findUnique({
      where: {
        username: username,
      },
    });
  
    if (user === null) {
      throw new Error(`User with username "${username}" not found.`);
    }
  
    return user.profileName !== null;
  }

  // ─────────────────────────────────────────────────────────────────────

  // handleProfileSetup method takes tokenCookie, profileName, and profileImage as arguments
  async handleProfileSetup(tokenCookie: string, profileName: string, profileImage: any): Promise<any> {
    // Declare a variable to store the decoded JWT token

    // Declare a variable to store the email from the decoded token
    let emailFromCookies: string | undefined; 

    const decodedToken = await this.decodeToken(tokenCookie);

    console.log("passing by handlePorfileSetup \n");

    // Check if the decoded token is an object and has an email property
    if (typeof decodedToken === 'object' && decodedToken !== null) {
      emailFromCookies = decodedToken.email;
    } else {
      throw new Error('Invalid token format backend(handleProfileSetup).\n');
    }

    const existingUser: any = this.prisma.user.findUnique({ where: { profileName: profileName } });
    if (existingUser) {
      return {
        statusCode: 409,
        message: 'Username already exists',
      }
    }

    // Fetch the user from the database using the PrismaService and the email from the decoded token
    const user = await this.prisma.user.findUnique({ where: { username: emailFromCookies } });

    // Check if the user exists, otherwise throw an error
    if (!user) {
      return {
        statusCode: 404,
        message: 'username(email) not found',
      }
    }

    // Get the file extension of the profile image
    const fileExtension = extname(profileImage.originalname);

    // Generate a unique filename using uuidv4 and the file extension
    const uniqueFilename = uuidv4() + fileExtension;

    // Construct the file path for the profile image in the upload folder
    const filePath = `${this.uploadFolder}/${uniqueFilename}`;

    // Save the profile image to the local folder using the saveImageToLocalFolder method
    try {
      await this.saveImageToLocalFolder(profileImage, filePath);
    } catch (error) {
      return {
        statusCode: 400,
        message: error,
      }
    }   

    // Update the user profile in the database using the PrismaService
    const userProfile = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        profileName: profileName,
        profileImageUrl: filePath,
      },
    });

    // Return the updated user profile
    return {
      statusCode: 200,
      data: userProfile,
    };
  }

// ─────────────────────────────────────────────────────────────────────────────

  // saveImageToLocalFolder method takes a file and a file path as arguments
  private async saveImageToLocalFolder(file: Express.Multer.File, filePath: string): Promise<void> {

    // Initialize ClamAV scanner
    const clamscan = await new ClamScan().init();
    // Scan the uploaded file for viruses
    const { is_infected } = await clamscan.scan_file(file.path);
    if (is_infected) {
      throw new Error('The uploaded file contains a virus.');
    }

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