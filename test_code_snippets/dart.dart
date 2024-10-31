import 'db.dart';
import 'prefs.dart';

const bool USE_EMULATOR = false;

final navigatorKey = GlobalKey<NavigatorState>();

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform);

  FirebaseUIAuth.configureProviders([
    GoogleProvider(iOSPreferPlist: true, clientId: '15'),
    FacebookProvider(clientId: '12345789')
  ]);
}