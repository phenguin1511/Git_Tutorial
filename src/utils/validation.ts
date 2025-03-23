import express from 'express';
import { body, validationResult, ValidationChain } from 'express-validator';
import { RunnableValidationChains } from 'express-validator/lib/middlewares/schema.js';
import { ErrorWithStatus, EntityError } from '~/models/Errors.js';
import HTTP_STATUS from '~/constants/httpStatus.js';
// can be reused by many routes
const validate = (validations: RunnableValidationChains<ValidationChain>) => {
  return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    await validations.run(req);
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }
    const errorObject = errors.mapped();
    const entityError = new EntityError({ errors: {} });
    for (const key in errorObject) {
      const { msg } = errorObject[key];
      if (msg instanceof ErrorWithStatus && msg.status !== HTTP_STATUS.UNPROCESSABLE_ENTITY) {
        return next(msg);
      } else {
        entityError.errors[key] = errorObject[key];
      }
    }
    next(entityError);
  };
};

export { validate };
