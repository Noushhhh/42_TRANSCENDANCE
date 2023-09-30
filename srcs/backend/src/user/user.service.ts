// Import necessary modules and dependencies
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { DecodedPayload } from '../auth/interfaces/decoded-payload.interface';
import multer from 'multer';

/**
 * UserService class provides methods for user-related operations.
 * @class
 */
@Injectable()
export class UserService {
  // Declare private variables for JWT secret and upload folder path
  private JWT_SECRET: string | any;
  private readonly uploadFolder = 'uploads';

  /**
   * Constructor initializes the PrismaService and JWT_SECRET.
   * @constructor
   * @param {PrismaService} prisma - PrismaService instance.
   */
  constructor(private readonly prisma: PrismaService) {
    this.JWT_SECRET = process.env.JWT_SECRET;

    // Check if JWT_SECRET is set, otherwise throw an error
    if (!this.JWT_SECRET) {
      throw new Error('JWT_SECRET environment variable not set!');
    }
  }

  /**
  * ****************************************************************************
   * Checks if a user has been already registered.
   * @async
   * @param {DecodedPayload | null} payload - Decoded JWT payload.
   * @returns {Promise<any>} - Returns an object with registration status and message.
   * 
  * ****************************************************************************
  */

  async isClientRegistered(payload: DecodedPayload | null): Promise<any> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { username: payload?.email },
      });

      if (user?.firstConnection) {
        return {
          statusCode: 200,
          valid: true,
          message: 'Client already registered',
        };
      } else {
        return {
          statusCode: 404,
          valid: false,
          message: 'Client is not registered yet',
        };
      }
    } catch (error) {
      console.error(`Passing by isClientRegistered ${error}`);
      return { statusCode: 401, valid: false, message: error };
    }
  }

  /**
   * Handles profile setup for a user.
   * @async
   * @param {DecodedPayload | null} payload - Decoded JWT payload.
   * @param {string} profileName - User's profile name.
   * @param {any} profileImage - User's profile image.
   * @returns {Promise<any>} - Returns an object with profile setup status and message.
   */
  async handleProfileSetup(
    payload: DecodedPayload | null,
    profileName: string,
    profileImage: any
  ): Promise<any> {
    // Declare a variable to store the decoded JWT token
    const emailFromCookies = payload?.email;

    const registeredUser: any = await this.prisma.user.findUnique({
      where: { publicName: profileName },
    });

    if (registeredUser) {
      return {
        statusCode: 409,
        valid: false,
        message: 'Username already exists',
      };
    }

    // Fetch the user from the database using the PrismaService and the email from the decoded token
    const user = await this.prisma.user.findUnique({
      where: { username: emailFromCookies },
    });

    // Check if the user exists, otherwise throw an error
    if (!user) {
      return {
        statusCode: 404,
        valid: false,
        message: 'username not found',
      };
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
      console.error(error);
      return { statusCode: 400, valid: false, message: error };
    }

    // Update the user profile in the database using the PrismaService
    try {
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          publicName: profileName,
          avatar: filePath,
          firstConnection: true,
        },
      });

      // Return the updated user profile
      return {
        statusCode: 200,
        valid: true,
        message: 'Profile was successfully updated',
      };
    } catch (error) {
      return { statusCode: 400, valid: false, message: error };
    }
  }

  /**
  * ****************************************************************************
   * Saves an image to the local folder.
   * @async
   * @private
   * @param {Express.Multer.File} file - Image file to be saved.
   * @param {string} filePath - File path where the image will be saved.
   * @returns {Promise<void>} - Returns a promise that resolves when the image is saved.
  * ****************************************************************************
  */
  private async saveImageToLocalFolder(
    file: Express.Multer.File,
    filePath: string
  ): Promise<void> {
    try {
      // Import the 'fs' module to work with the file system
      const fs = require('fs');

      // Create a write stream to write the file buffer to the specified file path
      const writeStream = fs.createWriteStream(filePath);

      // Write the file buffer to the write stream
      writeStream.write(file.buffer);

      // End the write stream
      writeStream.end();
    } catch (error) {
      throw error;
    }
  }
}