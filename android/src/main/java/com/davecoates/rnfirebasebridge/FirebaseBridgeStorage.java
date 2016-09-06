package com.davecoates.rnfirebasebridge;

import android.support.annotation.Nullable;
import com.facebook.react.bridge.*;
import com.facebook.react.modules.core.RCTNativeAppEventEmitter;
import com.google.firebase.storage.FirebaseStorage;
import com.google.firebase.storage.StorageReference;
import com.google.android.gms.tasks.OnFailureListener;
import com.google.android.gms.tasks.OnSuccessListener;
import java.lang.reflect.Method;
import java.util.*;
import android.net.Uri;
import android.support.annotation.NonNull;

public class FirebaseBridgeStorage extends ReactContextBaseJavaModule {

    public FirebaseBridgeStorage(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "FirebaseBridgeStorage";
    }

    // See https://firebase.googleblog.com/2016/07/5-tips-for-firebase-storage.html

    private StorageReference getRefFromUrl(String storageUrl) {
        FirebaseStorage storage = FirebaseStorage.getInstance();
        if (storageUrl == null) {
            return storage.getReference();
        }
        return storage.getReferenceFromUrl(storageUrl);
    }
  
    private WritableMap convertRef(StorageReference ref) {
        final WritableMap m = Arguments.createMap();
        m.putString("bucket", ref.getBucket());
        m.putString("fullPath", ref.getPath());
        m.putString("name", ref.getName());
        m.putString("storageFileUrl", String.format("gs://%s%s", ref.getBucket(), ref.getPath()));
        return m;
    }
  
    private WritableMap convertStorageUrl(Uri uri) {
        final WritableMap m = Arguments.createMap();
        m.putString("storageUrl", uri.toString());
        return m;
    }

    // /**
    //  * Child of locationURL
    //  *   Creates a new FIRStorageReference pointing to a child object of the current reference.
    //  *   path = foo child = bar newPath = foo/bar path = foo/bar child = baz newPath = foo/bar/baz
    //  *   All leading and trailing slashes will be removed, and consecutive slashes will be compressed to single slashes.
    //  *   For example: child = /foo/bar newPath = foo/bar child = foo/bar/ newPath = foo/bar child = foo///<bar newPath = foo/bar
    //  * - storageFileURL should be like gs://<your-firebase-storage-bucket>
    //  * - pathString is images/island.jpg
    //  */
    @ReactMethod
    public void child(String storageUrl, String path, Promise promise) {
        promise.resolve(convertRef(getRefFromUrl(storageUrl).child(path)));
    }
  
    @ReactMethod
    public void writeToFile(String storageUrl, String localFileUrl, Promise promise) {
        promise.reject("write-to-file-not-implemented-for-android", "implemented only in iOS, implement android version yourself or use downloadUrlWithCompletion and for example react-native-fetch-blob.");
    }

    // npm install --save react-native-fetch-blob
    // https://github.com/wkh237/react-native-fetch-blob
    @ReactMethod
    public void downloadUrlWithCompletion(String storageUrl, String path, final Promise promise) {
        StorageReference storageRef = getRefFromUrl(storageUrl).child(path);
        storageRef.getDownloadUrl().addOnSuccessListener(new OnSuccessListener<Uri>() {
            @Override
            public void onSuccess(Uri uri) {
                promise.resolve(convertStorageUrl(uri));
            }
        }).addOnFailureListener(new OnFailureListener() {
            @Override
            public void onFailure(@NonNull Exception exception) {
                promise.reject(exception);
            }
        });
    }

}
