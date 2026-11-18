import {execFileSync} from 'node:child_process';

// Included by the existing script-test discovery in lint.yml and just test.
execFileSync('python3', ['-m', 'unittest', 'discover', '-s', 'scripts', '-p', 'test_publish_generated.py'], {
  stdio: 'inherit',
});
