provider "google-beta" {
  credentials = file("credentials/justforfun-283718-dd6bcb1abb0c.json")
  project     = "justforfun-283718"
  region      = "us-east1"
}


resource "google_project_service" "cloudresourcemanager-api" {
  service                    = "cloudresourcemanager.googleapis.com"
  provider                   = google-beta
  disable_dependent_services = true
}

resource "google_project_service" "firebase-api" {
  service                    = "firebase.googleapis.com"
  provider                   = google-beta
  disable_dependent_services = true
  depends_on                 = [google_project_service.cloudresourcemanager-api]
}

resource "google_project_service" "cloud-build-api" {
  service                    = "cloudbuild.googleapis.com"
  provider                   = google-beta
  disable_dependent_services = true
}


resource "google_firebase_project" "just-for-fun-firebase-project" {
  provider   = google-beta
  depends_on = [google_project_service.firebase-api]
}

resource "google_firebase_web_app" "basic" {
  provider     = google-beta
  project      = "justforfun-283718"
  display_name = "JustForFun"

  depends_on = [google_firebase_project.just-for-fun-firebase-project]
}

data "google_firebase_web_app_config" "basic" {
  provider   = google-beta
  web_app_id = google_firebase_web_app.basic.app_id
}


resource "google_storage_bucket" "file-storage" {
  provider           = google-beta
  name               = "just-for-fun-file-storage"
  location           = "US"
  force_destroy      = true
  bucket_policy_only = true

}

resource "google_storage_bucket" "bucket" {
  provider = google-beta
  name     = "just-for-fun-back-content"
}

resource "google_storage_bucket_object" "object" {
  provider = google-beta
  name   = "deploy.zip"
  bucket = google_storage_bucket.bucket.name
  source = "../back/dist/deploy.zip"
}


resource "google_app_engine_standard_app_version" "just-for-fun-app-back-standard" {
  provider   = google-beta
  version_id = "v1"
  service    = "default"
  runtime    = "nodejs12"

  entrypoint {
    shell = "node ./server.js"
  }

  deployment {
    zip {
      source_url = "https://storage.googleapis.com/${google_storage_bucket.bucket.name}/${google_storage_bucket_object.object.name}"
    }
  }

  env_variables = {
    port       = "8080"
    SECRET     = var.secrets.secret
    BUCKET_URL = var.secrets.bucket-url
  }
  depends_on = [google_storage_bucket_object.object]

  delete_service_on_destroy = true
}

resource "google_cloudbuild_trigger" "app-engine-trigger" {
  provider = google-beta
  github {
    owner = "anjapadu"
    name = "just-for-fun"
    push {
      branch = "^master$"
    }
  }

  filename = "back/cloudbuild.yaml"
}

output "firebase-id" {
  value = "${google_firebase_project.just-for-fun-firebase-project.id}"
}
