// @flow
import { NativeModules, NativeAppEventEmitter } from 'react-native';
import invariant from 'invariant';
import type {
  StorageReference as StorageReferenceType,
} from './types';
import RNFetchBlob from 'react-native-fetch-blob';

const NativeFirebaseBridgeStorage = NativeModules.FirebaseBridgeStorage;

// debug promise chain arg logging utility func 
function logArg(str, arg) {
    console.warn(str, JSON.stringify(arg));
    return arg;
}

export function FirebaseBridgeStorageException(message, error) {
    this.message = message;
    this.error = error;
}

export class StorageReference {

    parentPromise: Promise;

    constructor(parentPromise:?Promise = null) {
        this.parentPromise = parentPromise || Promise.resolve({});
        // console.log(`NativeFirebaseBridgeStorage:${NativeFirebaseBridgeStorage} StorageReference constructor this.parentPromise:`, this.parentPromise);
    }

    child(pathString:string) : StorageReferenceType {
        const promise = this.parentPromise
            //    .then(parentStorage => logArg(`child(${pathString}) parentStorage:`, parentStorage))
            .then(({ storageFileUrl }) => NativeFirebaseBridgeStorage.child(storageFileUrl, pathString))
            .catch(error => { throw new FirebaseBridgeStorageException(`child ${pathString} error`, error); });
        return new StorageReference(promise);
    }

    downloadUrlWithCompletion(path:string) : Promise {
        return this.parentPromise
            .then(parentStorage => logArg(`downloadUrlWithCompletion '${path}' with parentStorage:`, parentStorage))

        .then(({ storageFileUrl }) => NativeFirebaseBridgeStorage.downloadUrlWithCompletion(storageFileUrl, path))
            .then(storageUrl => logArg('downloadUrlWithCompletion storageUrl:', storageUrl))

        .catch(error => { throw new FirebaseBridgeStorageException(`downloadUrlWithCompletion(${path}) error`, error) });
    }

    pathAsDocumentsDirTarget(path:string) {
        const dirs = RNFetchBlob.fs.dirs;
        const targetPath = `${dirs.DocumentDir}/${path}`;
        const targetDir = targetPath.substring(0,targetPath.lastIndexOf('/'));
        return { targetPath, targetDir };
    }

    prepareTargetPath(storageUrl: String, path:String) : Promise {
        const { targetPath, targetDir } = this.pathAsDocumentsDirTarget(path);
        const result = {
            targetPath,
            storageUrl
        }
        // if needed create targetDir (otherwise we get an error fron RNFetchBlob)
        return RNFetchBlob.fs.exists(targetDir)
        .then(exists => {
            if (!exists) {
                return RNFetchBlob.fs.mkdir(targetDir)
                .then (() => result)
                .catch(error => console.log(`storage.js prepareTargetPath ${error} ignored.`)) // TODO check already exist error
                .then (() => result)
            } else {
                return result;
            }
        })
    }

    writeToFile(path:string) : Promise {
        return this.parentPromise
        //    .then(parentStorage => logArg(`writeToFile '${path}' with parentStorage:`, parentStorage))

        .then(({ storageFileUrl }) => NativeFirebaseBridgeStorage.downloadUrlWithCompletion(storageFileUrl, path))
        //    .then(storageUrl => logArg('writeToFile storageUrl:', storageUrl))

        .then(({ storageUrl }) => this.prepareTargetPath(storageUrl, path))
        //     .then(storageUrlAndTargetPath => logArg('writeToFile storageUrlAndTargetPath:', storageUrlAndTargetPath))

        .then(({ storageUrl, targetPath }) => RNFetchBlob
            .config({
                fileCache : true, // add this option that makes response data to be stored as a file, this is much more performant.
                path: targetPath
            })
            .fetch('GET', storageUrl/* , { some headers .. } */)
            .then(res => {
                // the temp file path, needs removal management!
                // console.log('writeToFile RNFetchBlob file saved to ', res.path());
                return res.path();
            })
            .catch(error => { throw new FirebaseBridgeStorageException(`writeToFile RNFetchBlob path:${path} get storageUrl:${storageUrl} into targetPath:${targetPath} catched error`, error); })
        )
        .catch(error => { throw new FirebaseBridgeStorageException(`writeToFile ${path} catch error`, error); });
    }
}

export default {
    ref() {
        return new StorageReference();
    },
};
