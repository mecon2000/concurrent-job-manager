curl -X POST http://localhost:3000/jobs -H "Content-Type: application/json" -d "{\"name\":\"rong\",\"executablePath\":\"C:/gitrep/job-manager/test/simulate-job.bat\",\"args\":[1]}"
curl -X POST http://localhost:3000/jobs -H "Content-Type: application/json" -d "{\"name\":\"rong\",\"executablePath\":\"C:/gitrep/job-manager/test/simulate-job.bat\",\"args\":[1]}"
curl -X POST http://localhost:3000/jobs -H "Content-Type: application/json" -d "{\"name\":\"rong\",\"executablePath\":\"C:/gitrep/job-manager/test/simulate-job.bat\",\"args\":[1]}"
curl -X POST http://localhost:3000/jobs -H "Content-Type: application/json" -d "{\"name\":\"rong\",\"executablePath\":\"C:/gitrep/job-manager/test/simulate-job.bat\",\"args\":[1]}"
curl -X POST http://localhost:3000/jobs -H "Content-Type: application/json" -d "{\"name\":\"rong\",\"executablePath\":\"C:/gitrep/job-manager/test/simulate-job.bat\",\"args\":[1]}"

curl -X POST http://localhost:3000/jobs -H "Content-Type: application/json" -d "{\"name\":\"job1\",\"executablePath\":\"C:/gitrep/job-manager/test/simulate-job.bat\",\"args\":[1]}"
curl -X POST http://localhost:3000/jobs -H "Content-Type: application/json" -d "{\"name\":\"job1\",\"executablePath\":\"C:/gitrep/job-manager/test/simulate-job.bat\",\"args\":[1]}"
curl -X POST http://localhost:3000/jobs -H "Content-Type: application/json" -d "{\"name\":\"job1\",\"executablePath\":\"C:/gitrep/job-manager/test/simulate-job.bat\",\"args\":[1]}"
curl -X POST http://localhost:3000/jobs -H "Content-Type: application/json" -d "{\"name\":\"job1\",\"executablePath\":\"C:/gitrep/job-manager/test/simulate-job.bat\",\"args\":[1]}"
curl -X POST http://localhost:3000/jobs -H "Content-Type: application/json" -d "{\"name\":\"job1\",\"executablePath\":\"C:/gitrep/job-manager/test/simulate-job.bat\",\"args\":[1]}"

curl -X POST http://localhost:3000/jobs -H "Content-Type: application/json" -d "{\"name\":\"JOBBBBBB100\",\"executablePath\":\"C:/gitrep/job-manager/test/simulate-job.bat\",\"args\":[1]}"
curl -X POST http://localhost:3000/jobs -H "Content-Type: application/json" -d "{\"name\":\"JOBBBBBB100\",\"executablePath\":\"C:/gitrep/job-manager/test/simulate-job.bat\",\"args\":[1]}"
curl -X POST http://localhost:3000/jobs -H "Content-Type: application/json" -d "{\"name\":\"JOBBBBBB100\",\"executablePath\":\"C:/gitrep/job-manager/test/simulate-job.bat\",\"args\":[1]}"
curl -X POST http://localhost:3000/jobs -H "Content-Type: application/json" -d "{\"name\":\"JOBBBBBB100\",\"executablePath\":\"C:/gitrep/job-manager/test/simulate-job.bat\",\"args\":[1]}"
curl -X POST http://localhost:3000/jobs -H "Content-Type: application/json" -d "{\"name\":\"JOBBBBBB100\",\"executablePath\":\"C:/gitrep/job-manager/test/simulate-job.bat\",\"args\":[1]}"

timeout /t 4

curl -X GET http://localhost:3000/jobs -H "Content-Type: application/json" | jq

curl -X GET http://localhost:3000/stats -H "Content-Type: application/json" | jq
