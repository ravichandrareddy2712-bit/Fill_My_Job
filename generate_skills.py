import json

skills = [
  # Languages
  "JavaScript", "Python", "Java", "C++", "C", "C#", "Ruby", "Go", "Rust", "PHP", "Swift", "Kotlin", "R", "TypeScript", 
  "Objective-C", "SQL", "NoSQL", "HTML", "CSS", "Dart", "Scala", "MATLAB", "Perl", "Shell Scripting", "Bash", "Lua", 
  "Assembly", "Groovy", "Elixir", "Clojure", "F#", "Haskell", "Erlang", "COBOL", "Fortran", "LISP", "Prolog", "Pascal", 
  "Visual Basic", "VBScript", "ActionScript", "VBA", "Delphi", "Solidity", "Vyper", "GDScript", "Apex", "Julia", "SAS", "ABAP",
  
  # Frontend Frameworks & Libs
  "React", "React.js", "Angular", "Vue.js", "Vue", "Svelte", "Next.js", "Nuxt.js", "Gatsby", "Ember.js", "Backbone.js", 
  "jQuery", "Bootstrap", "Tailwind CSS", "Material-UI", "Chakra UI", "Ant Design", "Styled Components", "Sass", "Less", 
  "Stylus", "PostCSS", "Redux", "MobX", "Zustand", "Recoil", "RxJS", "Three.js", "WebGL", "D3.js", "Chart.js", "Recharts", 
  "Framer Motion", "GSAP", "Phaser", "HTML5", "CSS3", "Alpine.js", "SolidJS", "Lit", "Stencil", "Babel", "Webpack", "Vite", "Rollup",
  
  # Backend Frameworks & Libs
  "Node.js", "Express.js", "NestJS", "Koa", "Fastify", "Django", "Flask", "FastAPI", "Spring Boot", "Ruby on Rails", 
  "Laravel", "Symfony", "CodeIgniter", "ASP.NET Core", "Entity Framework", "Pyramid", "Tornado", "Bottle", "CherryPy", 
  "Gin", "Fiber", "Echo", "Beego", "Phoenix", "Ktor", "Micronaut", "Quarkus", "Dropwizard", "Play Framework", "Grails", 
  "Sinatra", "Hanami", "CakePHP", "Yii", "Zend Framework", "Phalcon", "Slim", "LoopBack", "Meteor", "Sails.js", "Hapi.js", 
  "AdonisJS", "FeathersJS", "GraphQL", "Apollo", "REST API", "gRPC", "WebSockets", "Socket.io", "Strapi", "Hasura",
  
  # Data Science, ML, AI, AIML
  "AIML", "AI/ML", "Machine Learning", "Deep Learning", "Artificial Intelligence", "Data Science", 
  "Natural Language Processing (NLP)", "Computer Vision", "Generative AI", "LLMs", "ChatGPT", "OpenAI API", 
  "Hugging Face", "LangChain", "TensorFlow", "PyTorch", "Keras", "Scikit-learn", "Pandas", "NumPy", "Matplotlib", 
  "Seaborn", "Plotly", "NLTK", "Spacy", "OpenCV", "XGBoost", "LightGBM", "CatBoost", "SciPy", "Statsmodels", 
  "Spark MLlib", "H2O.ai", "DataRobot", "Dataiku", "RapidMiner", "KNIME", "Alteryx", "Neural Networks", 
  "CNN", "RNN", "Transformers", "BERT", "Stable Diffusion", "Midjourney", "Prompt Engineering", "LlamaIndex",
  
  # Data Engineering & Big Data
  "Data Engineering", "Big Data", "Hadoop", "Apache Spark", "Apache Kafka", "Apache Flink", "Apache Storm", 
  "Apache Samza", "Apache Hive", "Apache Pig", "Apache HBase", "Apache Cassandra", "Apache Zookeeper", "Apache Oozie", 
  "Apache Sqoop", "Apache Flume", "Apache Mahout", "Apache Ambari", "Apache Airflow", "Luigi", "Prefect", "Dagster", 
  "dbt", "Snowflake", "Databricks", "Amazon Redshift", "Google BigQuery", "Azure Synapse Analytics", "AWS Glue", 
  "Google Dataflow", "Azure Data Factory", "ETL", "ELT", "Data Warehousing", "Data Lakes",
  
  # Databases
  "MySQL", "PostgreSQL", "SQLite", "MariaDB", "Oracle", "Microsoft SQL Server", "MongoDB", "Cassandra", "Redis", 
  "Elasticsearch", "Neo4j", "CouchDB", "DynamoDB", "Firebase", "Supabase", "Prisma", "Sequelize", "Mongoose", 
  "TypeORM", "Amazon Aurora", "Google Cloud SQL", "Azure SQL Database", "IBM Db2", "SAP HANA", "Teradata", 
  "CockroachDB", "TiDB", "ClickHouse", "Druid", "Pinot", "InfluxDB", "TimescaleDB", "Prometheus", "Graphite", 
  "OpenTSDB", "FaunaDB", "ArangoDB", "OrientDB", "RavenDB", "Couchbase", "Riak", "Aerospike", "Memcached", 
  "Hazelcast", "Ehcache", "RocksDB", "LevelDB", "LMDB", "Berkeley DB", "Core Data", "Realm", "Room", "WatermelonDB", 
  "PouchDB", "RxDB", "Dexie.js", "localForage", "Milvus", "Pinecone", "Weaviate", "ChromaDB", "Vector Databases",
  
  # Cloud & DevOps
  "AWS", "Google Cloud Platform (GCP)", "Microsoft Azure", "Heroku", "Vercel", "Netlify", "DigitalOcean", "Linode", 
  "Terraform", "Ansible", "Chef", "Puppet", "Jenkins", "GitLab CI/CD", "GitHub Actions", "Travis CI", "CircleCI", 
  "Bitbucket Pipelines", "Docker", "Kubernetes", "Amazon ECS", "Amazon EKS", "Google Kubernetes Engine (GKE)", 
  "Azure Kubernetes Service (AKS)", "AWS Fargate", "Google Cloud Run", "Azure Container Instances (ACI)", 
  "AWS Lambda", "Google Cloud Functions", "Azure Functions", "Serverless Framework", "AWS CloudFormation", 
  "Google Cloud Deployment Manager", "Azure Resource Manager (ARM)", "Vagrant", "Packer", "Pulumi", "Grafana", 
  "ELK Stack", "Splunk", "Datadog", "New Relic", "AppDynamics", "Dynatrace", "Jaeger", "Zipkin", "OpenTelemetry", 
  "Istio", "Linkerd", "Consul", "Envoy", "Nginx", "Apache HTTP Server", "HAProxy", "Traefik", "Caddy", "Varnish", 
  "Squid", "CDN", "Cloudflare", "AWS CloudFront", "Google Cloud CDN", "Akamai", "Fastly", "Linux", "Unix", "Ubuntu", 
  "CentOS", "Debian", "Git", "GitHub", "GitLab", "Bitbucket",
  
  # Mobile App Dev
  "React Native", "Flutter", "Android Development", "iOS Development", "Ionic", "Cordova", "PhoneGap", "Xamarin", 
  ".NET MAUI", "NativeScript", "Expo", "Capacitor", "Appcelerator Titanium", "Sencha Touch", "jQuery Mobile", 
  "Onsen UI", "Framework7", "Quasar", "Vuetify", "SwiftUI", "Jetpack Compose",
  
  # Game Dev
  "Unity", "Unreal Engine", "Godot", "Cocos2d", "CryEngine", "Lumberyard", "Construct", "GameMaker Studio", 
  "RPG Maker", "Ren'Py", "Twine", "Pico-8", "Love2D", "MonoGame", "libGDX", "SFML", "SDL", "OpenGL", "Vulkan", 
  "DirectX", "Metal", "WebGPU",
  
  # Design & UI/UX
  "Figma", "Sketch", "Adobe XD", "Photoshop", "Illustrator", "InDesign", "Premiere Pro", "After Effects", 
  "Blender", "Maya", "3ds Max", "ZBrush", "AutoCAD", "SolidWorks", "UI Design", "UX Design", "Interaction Design", 
  "Visual Design", "Graphic Design", "Motion Graphics", "Video Editing", "3D Modeling", "3D Animation", "2D Animation", 
  "Prototyping", "Wireframing", "User Research", "Usability Testing", "A/B Testing", "Information Architecture", 
  "Design Systems", "Typography", "Color Theory", "Layout Design", "Logo Design", "Branding", "Illustration", "Iconography",
  
  # Methodologies & Management
  "Agile", "Scrum", "Kanban", "Waterfall", "DevOps", "CI/CD", "Test-Driven Development (TDD)", 
  "Behavior-Driven Development (BDD)", "Domain-Driven Design (DDD)", "Microservices", "Serverless", 
  "Event-Driven Architecture", "System Design", "Software Architecture", "Design Patterns", "Algorithms", 
  "Data Structures", "Object-Oriented Programming (OOP)", "Functional Programming", "Reactive Programming", 
  "Concurrent Programming", "Asynchronous Programming", "Multithreading", "Web Performance Optimization", "SEO", 
  "Web Accessibility (a11y)", "Responsive Web Design", "Progressive Web Apps (PWA)", "Single Page Applications (SPA)", 
  "Server-Side Rendering (SSR)", "Static Site Generation (SSG)", "Jamstack", "WebAssembly", "WebRTC", "Jira", 
  "Trello", "Asana", "Monday.com", "Notion", "Confluence", "Slack", "Microsoft Teams", "Zoom", "Google Workspace", 
  "Microsoft Office 365", "Product Management", "Project Management", "Business Analysis",
  
  # Testing & QA
  "Jest", "Mocha", "Chai", "Jasmine", "Karma", "Cypress", "Puppeteer", "Playwright", "Selenium", "Appium", 
  "JUnit", "TestNG", "PyTest", "RSpec", "Capybara", "Cucumber", "Storybook", "Postman", "SoapUI", "Katalon Studio", 
  "JMeter", "LoadRunner", "Gatling", "Locust", "SonarQube", "Fortify", "Checkmarx", "Veracode", "Snyk", "Dependabot", 
  "QA", "Quality Assurance", "Automated Testing", "Manual Testing", "API Testing",
  
  # Security & Cyber
  "Cybersecurity", "OWASP ZAP", "Burp Suite", "Wireshark", "Nmap", "Metasploit", "Kali Linux", "Penetration Testing", 
  "Vulnerability Scanning", "Security Auditing", "Ethical Hacking", "Reverse Engineering", "Malware Analysis", 
  "Digital Forensics", "Incident Response", "Cryptography", "Network Security", "Information Security", "IAM", "OAuth", "JWT",
  
  # Hardware & Electronics
  "Raspberry Pi", "Arduino", "ESP32", "ESP8266", "Microcontrollers", "Microprocessors", "Embedded Systems", "IoT", 
  "Robotics", "ROS", "PLC", "SCADA", "FPGA", "Verilog", "VHDL", "PCB Design", "Altium Designer", "Eagle", "KiCad", 
  "Proteus", "OrCAD", "LTspice", "LabVIEW", "Simulink", "AutoCAD Electrical", "SolidWorks Electrical",
  
  # Web3 & Blockchain
  "Blockchain", "Ethereum", "Bitcoin", "Smart Contracts", "Web3.js", "Ethers.js", "Truffle", "Hardhat", "Ganache", 
  "IPFS", "MetaMask", "DeFi", "NFTs", "DApps", "Polygon", "Solana",
  
  # Soft Skills
  "Problem Solving", "Critical Thinking", "Communication", "Teamwork", "Leadership", "Time Management", 
  "Adaptability", "Conflict Resolution", "Empathy", "Creativity", "Innovation", "Emotional Intelligence", 
  "Active Listening", "Negotiation", "Presentation Skills", "Public Speaking", "Writing", "Technical Writing", 
  "Documentation", "Mentoring", "Coaching", "Customer Service", "Sales", "Marketing", "Strategic Planning", 
  "Data Analysis", "Financial Analysis", "Risk Management", "Human Resources", "Recruiting", "Supply Chain Management", 
  "Logistics", "Operations Management", "Entrepreneurship", "Startups", "English", "Spanish", "French", "German"
]

unique_skills = []
seen = set()
for s in skills:
    if s.lower() not in seen:
        unique_skills.append(s)
        seen.add(s.lower())

unique_skills.sort()

with open('src/data/skills.json', 'w', encoding='utf-8') as f:
    json.dump(unique_skills, f, indent=2)

print("Generated massive skills.json with", len(unique_skills), "items.")
