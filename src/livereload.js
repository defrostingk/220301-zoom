// For Live Reload Server
import livereload from 'livereload';
import connectLivereload from 'connect-livereload';

const liveReloadServer = livereload.createServer({
  exts: ['pug', 'js', 'css'],
});
liveReloadServer.server.once('connection', () => {
  setTimeout(() => {
    liveReloadServer.refresh('/');
  }, 100);
});

const app = express();

// live reload
app.use(connectLivereload());
