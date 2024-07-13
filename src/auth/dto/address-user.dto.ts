import { IsInt, IsOptional, IsString, MaxLength } from 'class-validator';

export class AddressUserDto {
  @IsString()
  street: string;

  @IsInt()
  streetNumber: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  addressLine2?: string;

  @IsString()
  @MaxLength(10)
  zipCode: string;

  @IsString()
  city: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsString()
  country: string;

  @IsOptional()
  @IsString()
  additionalInstructions?: string;
}
