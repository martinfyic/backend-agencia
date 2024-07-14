import { IsInt, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateAddressUserDto {
  @IsOptional()
  @IsString()
  street?: string;

  @IsOptional()
  @IsInt()
  streetNumber?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  addressLine2?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  zipCode?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  additionalInstructions?: string;
}
