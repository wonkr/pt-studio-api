# NEST JS SETUP

* install the command line interface globally
```sh
npm i -g @nestjs/cli
```

* create new project
```sh
nest new .
```

## Dependency Vulnerability Assessment
After installing nestjs/cli, there were 5 vulnerabilities (4 moderate, 1 high) in `picomatch`, introduced transitively through `@nestjs/cli`.

*Risk Assessment*
* Location: `devDependencies` only - not included in production build.
* Attack surface: limited to development environment and CI/CD pipeline
* Decision: monitor only, no immediate action required.

*Lesson learned*
Not all vulnerabilities require immediate fixes. The key is to assess the actual attack surface and make a risk-based decision rather than blindly running `npm audit fix`.

*Open Question*
How do real-world appsec teams typically handle transitive vulnerabilities(간접 의존성 취약점) in `devDependencies`? Is there a standardized policy or threshold for when action is required?