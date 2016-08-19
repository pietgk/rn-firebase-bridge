// @flow
import { NativeModules, NativeAppEventEmitter } from 'react-native';
import invariant from 'invariant';
import type {
  StorageReference as StorageReferenceType,
} from './types';

const NativeFirebaseBridgeStorage = NativeModules.FirebaseBridgeStorage;

export class StorageReference {

    parentPromise: Promise;

    constructor(parentPromise:?Promise = null) {
        this.parentPromise = parentPromise || Promise.resolve({});
        // console.log(`NativeFirebaseBridgeStorage:${NativeFirebaseBridgeStorage} StorageReference constructor this.parentPromise:`, this.parentPromise);
    }

    child(pathString:string) : StorageReferenceType {
        const promise = this.parentPromise
            .then(
                r => { console.log(`child ${pathString} parentPromise r:`, r); return r; })
            .then(
                ({ storageFileUrl }) => NativeFirebaseBridgeStorage.child(storageFileUrl, pathString))
            .catch(
                error => console.log(`child ${pathString} error`, error));
        console.log(`child ${pathString} promise passed to StorageReference:`, promise)
        return new StorageReference(promise);
    }

    writeToFile(path:string) : Promise {
        return this.parentPromise
            .then(
                r => { console.log(`writeToFile '${path}' parentPromise r:`, r); return r; })
            .then(
                ({ storageFileUrl }) => NativeFirebaseBridgeStorage.writeToFile(storageFileUrl, path))
            .catch(
                error => console.log(`writeToFile ${path} error`, error));
    }
}

export default {
    ref() {
        return new StorageReference();
    },
};
