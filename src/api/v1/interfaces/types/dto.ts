export type ServiceResponseDto = {
    success: boolean;
    message: string;
    status: number;
    extras?: any;
}

export type TokenFromRequestDto = {
    accessToken?: string;
    refreshToken?: string;
    message?: string;
}