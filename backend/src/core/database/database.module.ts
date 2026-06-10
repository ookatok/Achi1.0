import { Module, Global } from '@nestjs/common';
import { DatabaseProvider, DRIZZLE_PROVIDER } from './database.provider';

@Global() // Make the database module global so we don't have to import it in every feature module
@Module({
  providers: [DatabaseProvider],
  exports: [DRIZZLE_PROVIDER],
})
export class DatabaseModule {}
