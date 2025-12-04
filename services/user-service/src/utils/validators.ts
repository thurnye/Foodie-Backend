

import { commonSchemas, optionalUserFields } from '@foodie/libs';
import Joi from 'joi';

/**
 * Create profile validation schema
 */
export const createProfileSchema = Joi.object({
  email: commonSchemas.email,
  password: commonSchemas.password,

  
  // Spread in all other optional fields
  ...optionalUserFields,
  // Make first and last name required for creation
  firstName: optionalUserFields.firstName.required(),
  lastName: optionalUserFields.lastName.required(),
});


/**
 * Edit profile validation schema
 */
export const editProfileSchema = Joi.object({
  ...optionalUserFields,
}).min(1); // At least one field must be updated
