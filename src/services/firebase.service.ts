import { Injectable } from '@nestjs/common';
import * as firebase from 'firebase-admin';
import * as firebaseConfig from '../../firebase.config.json';

@Injectable()
export class FirebaseService {
  private firebaseAdmin: firebase.app.App;
  constructor() {
    const params = {
      type: firebaseConfig.type,
      projectId: firebaseConfig.project_id,
      privateKeyId: firebaseConfig.private_key_id,
      privateKey: firebaseConfig.private_key,
      clientEmail: firebaseConfig.client_email,
      clientId: firebaseConfig.client_id,
      authUri: firebaseConfig.auth_uri,
      tokenUri: firebaseConfig.token_uri,
      authProviderX509CertUrl: firebaseConfig.auth_provider_x509_cert_url,
      clientC509CertUrl: firebaseConfig.client_x509_cert_url,
    };
    this.firebaseAdmin = firebase.initializeApp({
      credential: firebase.credential.cert(params),
    });
  }

  signUp(data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) {
    const { firstName, lastName, email, password } = data;
    return this.firebaseAdmin.auth().createUser({
      displayName: `${firstName} ${lastName}`,
      email,
      emailVerified: false,
      password,
    });
  }
}
