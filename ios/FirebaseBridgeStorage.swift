//
//  FirebaseBridgeStorage.swift
//
//  Created by Piet Groot Kormelink on 15/07/2016.
//

import Firebase
import FirebaseStorage

@objc(FirebaseBridgeStorage)
class FirebaseBridgeStorage: NSObject { //, RCTInvalidating {
  
  var bridge: RCTBridge!
  
  //  func invalidate() {
  //  }
  
  override init() {
    super.init()
  }

  func getRefFromUrl(storageFileUrl: String?) -> FIRStorageReference {
    let url = storageFileUrl ?? ""
    // debugPrint(url)
    var r:FIRStorageReference
    if !url.isEmpty {
      r = FIRStorage.storage().referenceForURL(url)
    } else {
      r = FIRStorage.storage().reference()
    }
    // debugPrint(r)
    return r
  }
  
  func convertRef(ref:FIRStorageReference) -> Dictionary<String, String> {
    return [
      "bucket": ref.bucket, // The name of the Google Cloud Storage bucket associated with this reference, in gs://bucket/path/to/object.txt, the bucket would be: 'bucket'.
      "fullPath": ref.fullPath, // In gs://bucket/path/to/object.txt, the full path would be: 'path/to/object.txt'
      "name": ref.name, // The short name of the object associated with this reference, in gs://bucket/path/to/object.txt, the name of the object would be: 'object.txt'.
      "storageFileUrl": String("gs://\(ref.bucket)/\(ref.fullPath)"),
    ]
  }

  func convertStorageUrl(URL:NSURL) -> Dictionary<String, String> {
    return [
      "storageUrl": URL.absoluteString
    ]
  }
  
  /**
   * Child of locationURL
   *   Creates a new FIRStorageReference pointing to a child object of the current reference.
   *   path = foo child = bar newPath = foo/bar path = foo/bar child = baz newPath = foo/bar/baz
   *   All leading and trailing slashes will be removed, and consecutive slashes will be compressed to single slashes.
   *   For example: child = /foo/bar newPath = foo/bar child = foo/bar/ newPath = foo/bar child = foo///<bar newPath = foo/bar
   * - storageFileURL should be like gs://<your-firebase-storage-bucket>
   * - pathString is images/island.jpg
   */
  @objc func child(storageFileUrl: String?, path:String, resolver resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) {
    resolve(convertRef(getRefFromUrl(storageFileUrl).child(path)))
  }
  
  /**
   * Download to a local file
   *   The writeToFile:completion: method downloads a file directly to a local device.
   *   Use this if your users want to have access to the file while offline or to share in a different app.
   *   writeToFile:completion: returns an FIRStorageDownloadTask which you can use to manage your download and monitor the status of the upload.
   * - storageFileURL should be like gs://<your-firebase-storage-bucket>
   * - localFileURL is file://local/images/island.jpg
   */
  @objc func writeToFile(storageFileUrl:String, localFileUrl:String, resolver resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) {
    // use storage.js::writeToFile implementation
    
    let storageFileRef = getRefFromUrl(storageFileUrl)
    let localUrl = fileInDocumentsDirectoryUrl(localFileUrl)
    // debugPrint(localUrl)
    
    // let downloadTask =
    storageFileRef.writeToFile(localUrl) { (URL, error) -> Void in
      if (error != nil) {
        // debugPrint(error)
        reject("FirebaseBridgeStorage.writeToFile failed", error?.localizedDescription, error)
      } else {
        // debugPrint(URL!.absoluteString)
        resolve(URL!.absoluteString) // return local file url
      }
    }
  }

  /**
   * Generate a download URL
   *   If you already have download infrastructure based around URLs, 
   *   or just want a URL to share, you can get the download URL for a file by calling the downloadURLWithCompletion: method on a storage reference.
   * - storageFileURL should be like gs://<your-firebase-storage-bucket>
   */
  @objc func downloadUrlWithCompletion(storageFileUrl:String?, path: String, resolver resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) {
    let storageFileRef = getRefFromUrl(storageFileUrl).child(path);
    storageFileRef.downloadURLWithCompletion { (URL, error) -> Void in
      if (error != nil) {
        reject("FirebaseBridgeStorage.downloadURLWithCompletion failed", error?.localizedDescription, error)
      } else {
        resolve(self.convertStorageUrl(URL!))
      }
    }
  }
  
  /**
   * Download in memory
   *   Download the file to an NSData object in memory using the dataWithMaxSize:completion: method.
   *   This is the easiest way to quickly download a file, but it must load entire contents of your file into memory.
   *   If you request a file larger than your app's available memory, your app will crash.
   *   To protect against memory issues, make sure to set the max size to something you know your app can handle, or use another download method.
   * - storageFileURL should be like gs://<your-firebase-storage-bucket>
   */
  @objc func dataWithMaxSize(storageFileUrl:String?, maxSize:Int64, resolver resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) {
    let storageFileRef = getRefFromUrl(storageFileUrl)
    storageFileRef.dataWithMaxSize(maxSize) { (data, error) -> Void in
      if (error != nil) {
        reject("FirebaseBridgeStorage.dataWithMaxSize failed", error?.localizedDescription, error)
      } else {
        resolve(data) // Data for "images/island.jpg" is returned  ... let islandImage: UIImage! = UIImage(data: data!)
      }
    }
  }

  func getDocumentsURL() -> NSURL {
    let documentsURL = NSFileManager.defaultManager().URLsForDirectory(.DocumentDirectory, inDomains: .UserDomainMask)[0]
    return documentsURL
  }
  
  func fileInDocumentsDirectoryUrl(filename: String) -> NSURL {
    return getDocumentsURL().URLByAppendingPathComponent(filename)
  }
}

