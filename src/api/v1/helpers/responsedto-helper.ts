import { ServiceResponseDto } from "../interfaces/types/module";

export const buildSuccessResponse = (res: ServiceResponseDto, message: string | undefined = undefined): ServiceResponseDto => {
    res.status = 200;
    res.message = message ?? "Success";
    res.success = true;
    return res;
};

export const buildNotFoundResponse = (res: ServiceResponseDto, message: string | undefined = undefined): ServiceResponseDto => {
    res.status = 404;
    res.message = message ?? "Resource not found";
    res.success = false;
    return res;
}

export const buildResponse = (message: string, status: number, success: boolean, res: ServiceResponseDto | undefined = undefined): ServiceResponseDto => {
    res = {
        message,
        status,
        success
    }

    return res;
}

export const buildBaseResponse = (): ServiceResponseDto => {
    return {
        message: "",
        success: false,
        status: 500,
    }
}