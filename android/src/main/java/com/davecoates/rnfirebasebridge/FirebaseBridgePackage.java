package com.davecoates.rnfirebasebridge;

import java.util.Arrays;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;
import com.facebook.react.bridge.JavaScriptModule;

import com.davecoates.rnfirebasebridge.FirebaseBridgeAuth;
import com.davecoates.rnfirebasebridge.FirebaseBridgeApp;
import com.davecoates.rnfirebasebridge.FirebaseBridgeUser;
import com.davecoates.rnfirebasebridge.FirebaseBridgeFacebookAuthProvider;
import com.davecoates.rnfirebasebridge.FirebaseBridgeTwitterAuthProvider;
import com.davecoates.rnfirebasebridge.FirebaseBridgeGoogleAuthProvider;
import com.davecoates.rnfirebasebridge.FirebaseBridgeGithubAuthProvider;
import com.davecoates.rnfirebasebridge.FirebaseBridgeDatabase;
import com.davecoates.rnfirebasebridge.FirebaseBridgeStorage;
import com.google.firebase.database.FirebaseDatabase;
import com.google.firebase.storage.FirebaseStorage;

public class FirebaseBridgePackage implements ReactPackage {

  @Override
  public List<Class<? extends JavaScriptModule>> createJSModules() {
    return Collections.emptyList();
  }

  @Override
  public List<ViewManager> createViewManagers(ReactApplicationContext reactContext) {
    return Collections.emptyList();
  }

  @Override
  public List<NativeModule> createNativeModules(
                              ReactApplicationContext reactContext) {
    List<NativeModule> modules = new ArrayList<>();

    modules.add(new FirebaseBridgeAuth(reactContext));
    modules.add(new FirebaseBridgeApp(reactContext));
    modules.add(new FirebaseBridgeUser(reactContext));
    modules.add(new FirebaseBridgeFacebookAuthProvider(reactContext));
    modules.add(new FirebaseBridgeGoogleAuthProvider(reactContext));
    modules.add(new FirebaseBridgeTwitterAuthProvider(reactContext));
    modules.add(new FirebaseBridgeGithubAuthProvider(reactContext));
    modules.add(new FirebaseBridgeDatabase(reactContext));
    modules.add(new FirebaseBridgeStorage(reactContext));

    return modules;
  }

}
