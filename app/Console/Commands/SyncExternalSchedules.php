<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use App\Models\ExternalSchedule;

class SyncExternalSchedules extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:sync-external-schedules';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting schedule synchronization...');

        DB::connection('campus')
            ->table('odbc_student_OOP_balance_2025')
            ->orderBy('StudentNo')
            ->chunk(1000, function ($records) {

                foreach ($records as $record) {

                    ExternalSchedule::create([
                        'student_no'           => $record->StudentNo,
                        'school_year'          => $record->UserSchoolYear,
                        'semester_code'       => $record->SemesterCode,

                        'subject_code'        => $record->SubjectCode,
                        'description'         => $record->Description,

                        'days_code'           => $record->DaysCode,
                        'start_time'          => $record->TODStart,
                        'end_time'            => $record->TODEnd,

                        'block_section'       => $record->BlockSection,
                        'class_room'          => $record->ClassRoom,

                        'employee_no'         => $record->EmpNo,
                        'employee_last_name'  => $record->Employee_LastName,
                        'employee_first_name' => $record->Employee_FirstName,
                        'employee_middle_name'=> $record->Employee_MidName,

                        'last_synced_at'      => now(),
                    ]);

                }

            });

        $this->info('Schedule synchronization completed.');

        return Command::SUCCESS;
    }
}
