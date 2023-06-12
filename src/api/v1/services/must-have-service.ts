import { buildBaseResponse, buildSuccessResponse, buildNotFoundResponse, buildResponse } from "../helpers/module";
import { Singleton } from "../interfaces/module";
import { ServiceResponseDto } from "../interfaces/types/module";
import { User } from "../models/module";
import { UserRepository } from "../repositories/user-repository";
import { deleteEntryFromUserArrayField } from '../helpers/module';

export class MustHaveService extends Singleton {
    private static instance: MustHaveService;

    private _userRepository: UserRepository = UserRepository.getInstance();

    private constructor() { super(); }

    public static getInstance(): MustHaveService {
        if (!MustHaveService.instance) {
            MustHaveService.instance = new MustHaveService();
        } 
        return MustHaveService.instance;
    }

    public async deleteMustHave(email: string, mustHaveId: string): Promise<ServiceResponseDto> {
        let response: ServiceResponseDto = buildBaseResponse();

        const user: User | undefined = await this._userRepository.getUser({ email: email });
        if (!user) {
            return buildNotFoundResponse(response);
        } else {
            const deleteResponse = await deleteEntryFromUserArrayField(user.mustHaves, mustHaveId);
            if (!deleteResponse[0] || deleteResponse[1] == undefined) {
                return buildNotFoundResponse(response, "No such entry was found");
            }
            const success = await this._userRepository.updateUser({ mustHaves: deleteResponse[1] }, { email: email });
            if (success) {
                return buildSuccessResponse(response);
            } else {
                return buildResponse("Error updating entry", 500, false);
            }
        }
    }
}